"""
Environment Variable Validation Utility

Provides startup validation for Lambda functions to ensure
all required environment variables are present.

Requirement 18.6: Validate required environment variables at Lambda startup
and fail fast with clear error messages.
"""

import os
import logging
from typing import List, Dict, Optional, Set
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class EnvValidationResult:
    """Result of environment variable validation."""
    valid: bool
    missing: List[str]
    warnings: List[str]
    
    def __bool__(self) -> bool:
        return self.valid


class EnvironmentValidator:
    """
    Environment variable validator for Lambda functions.
    
    Requirement 18.6: Validate required environment variables at startup
    and fail fast with clear error messages.
    
    Usage:
        validator = EnvironmentValidator()
        validator.require('SEND_MODE', 'AWS_REGION')
        validator.optional('LOG_LEVEL', default='INFO')
        result = validator.validate()
        if not result:
            raise RuntimeError(f"Missing env vars: {result.missing}")
    """
    
    # Global environment variables required by all functions
    GLOBAL_REQUIRED = {'AWS_REGION'}
    
    # Global optional variables with defaults
    GLOBAL_OPTIONAL = {
        'LOG_LEVEL': 'INFO',
        'ENVIRONMENT': 'production',
    }
    
    # Function-specific required variables
    FUNCTION_REQUIREMENTS = {
        'auth-middleware': {'COGNITO_USER_POOL_ID'},
        'contacts-create': {'CONTACTS_TABLE'},
        'contacts-read': {'CONTACTS_TABLE'},
        'contacts-update': {'CONTACTS_TABLE'},
        'contacts-delete': {'CONTACTS_TABLE'},
        'contacts-search': {'CONTACTS_TABLE'},
        'inbound-whatsapp-handler': {
            'CONTACTS_TABLE', 'MESSAGES_TABLE', 'MEDIA_FILES_TABLE',
            'MEDIA_BUCKET', 'SEND_MODE'
        },
        'outbound-whatsapp': {
            'CONTACTS_TABLE', 'MESSAGES_TABLE', 'MEDIA_BUCKET',
            'SEND_MODE', 'WHATSAPP_PHONE_NUMBER_ID_1'
        },
        'outbound-sms': {
            'CONTACTS_TABLE', 'MESSAGES_TABLE', 'SEND_MODE', 'SMS_POOL_ID'
        },
        'outbound-email': {
            'CONTACTS_TABLE', 'MESSAGES_TABLE', 'SEND_MODE',
            'SES_SENDER_EMAIL'
        },
        'bulk-job-create': {
            'BULK_JOBS_TABLE', 'BULK_RECIPIENTS_TABLE', 'BULK_QUEUE_URL'
        },
        'bulk-worker': {
            'BULK_JOBS_TABLE', 'BULK_RECIPIENTS_TABLE', 'SEND_MODE'
        },
        'bulk-job-control': {
            'BULK_JOBS_TABLE', 'BULK_QUEUE_URL'
        },
        'dlq-replay': {'DLQ_MESSAGES_TABLE'},
        'ai-query-kb': {'BEDROCK_KB_ID'},
        'ai-generate-response': {'BEDROCK_AGENT_ID'},
    }
    
    def __init__(self, function_name: str = None):
        """
        Initialize validator.
        
        Args:
            function_name: Lambda function name for function-specific validation
        """
        self.function_name = function_name
        self._required: Set[str] = set(self.GLOBAL_REQUIRED)
        self._optional: Dict[str, str] = dict(self.GLOBAL_OPTIONAL)
        
        # Add function-specific requirements
        if function_name and function_name in self.FUNCTION_REQUIREMENTS:
            self._required.update(self.FUNCTION_REQUIREMENTS[function_name])
    
    def require(self, *var_names: str) -> 'EnvironmentValidator':
        """
        Add required environment variables.
        
        Args:
            var_names: Variable names to require
        
        Returns:
            Self for chaining
        """
        self._required.update(var_names)
        return self
    
    def optional(self, var_name: str, default: str = None) -> 'EnvironmentValidator':
        """
        Add optional environment variable with default.
        
        Args:
            var_name: Variable name
            default: Default value if not set
        
        Returns:
            Self for chaining
        """
        self._optional[var_name] = default
        return self
    
    def validate(self, fail_fast: bool = True) -> EnvValidationResult:
        """
        Validate all required environment variables.
        
        Requirement 18.6: Fail fast with clear error message if missing
        
        Args:
            fail_fast: If True, raise exception on missing vars
        
        Returns:
            EnvValidationResult with validation status
        
        Raises:
            EnvironmentError: If fail_fast=True and variables are missing
        """
        missing = []
        warnings = []
        
        # Check required variables
        for var_name in self._required:
            value = os.environ.get(var_name)
            if not value:
                missing.append(var_name)
        
        # Set defaults for optional variables
        for var_name, default in self._optional.items():
            if not os.environ.get(var_name) and default is not None:
                os.environ[var_name] = default
                warnings.append(f"{var_name} not set, using default: {default}")
        
        result = EnvValidationResult(
            valid=len(missing) == 0,
            missing=missing,
            warnings=warnings
        )
        
        # Log validation result
        if result.valid:
            logger.info(f"Environment validation passed for {self.function_name or 'Lambda'}")
            for warning in warnings:
                logger.warning(warning)
        else:
            error_msg = f"Missing required environment variables: {', '.join(missing)}"
            logger.error(error_msg)
            
            if fail_fast:
                raise EnvironmentError(error_msg)
        
        return result
    
    def get(self, var_name: str, default: str = None) -> Optional[str]:
        """
        Get environment variable value.
        
        Args:
            var_name: Variable name
            default: Default value if not set
        
        Returns:
            Variable value or default
        """
        return os.environ.get(var_name, default)


def validate_environment(function_name: str = None, **additional_required) -> EnvValidationResult:
    """
    Convenience function to validate environment at startup.
    
    Usage:
        # At top of Lambda handler file
        validate_environment('outbound-whatsapp')
    
    Args:
        function_name: Lambda function name
        additional_required: Additional required variables
    
    Returns:
        EnvValidationResult
    """
    validator = EnvironmentValidator(function_name)
    
    for var_name in additional_required:
        validator.require(var_name)
    
    return validator.validate(fail_fast=True)


def get_send_mode() -> str:
    """
    Get SEND_MODE with validation.
    
    Returns:
        'LIVE' (production default)
    """
    mode = os.environ.get('SEND_MODE', 'LIVE').upper()
    if mode not in ('LIVE',):
        logger.warning(f"Invalid SEND_MODE '{mode}', defaulting to LIVE")
        return 'LIVE'
    return mode


def is_live_mode() -> bool:
    """Check if running in LIVE mode. Always True in production."""
    return True
