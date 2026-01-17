"""
WECARE.DIGITAL Shared Utilities

Core utility modules for message validation, rate limiting,
logging, metrics, error handling, TTL management, and environment validation.
"""

from .validator import MessageValidator, ValidationResult
from .rate_limiter import RateLimiter
from .logger import Logger, log_validation_failure, log_api_error, log_authentication_attempt
from .metrics import MetricsEmitter, get_metrics_emitter, AlertPublisher, get_alert_publisher
from .error_handler import retry_with_exponential_backoff, send_to_dlq, CircuitBreaker
from .ttl import (
    TTLManager,
    calculate_message_ttl,
    calculate_dlq_message_ttl,
    calculate_audit_log_ttl,
    calculate_rate_limit_ttl,
    ttl_to_decimal,
    is_expired,
    get_ttl_filter_expression,
    get_ttl_filter_values,
    TTL_MESSAGES,
    TTL_DLQ_MESSAGES,
    TTL_AUDIT_LOGS,
    TTL_RATE_LIMIT_TRACKERS,
)
from .env_validator import (
    EnvironmentValidator,
    validate_environment,
    get_send_mode,
    is_live_mode,
    is_dry_run_mode,
    EnvValidationResult,
)

__all__ = [
    'MessageValidator',
    'ValidationResult',
    'RateLimiter',
    'Logger',
    'log_validation_failure',
    'log_api_error',
    'log_authentication_attempt',
    'MetricsEmitter',
    'get_metrics_emitter',
    'AlertPublisher',
    'get_alert_publisher',
    'retry_with_exponential_backoff',
    'send_to_dlq',
    'CircuitBreaker',
    'TTLManager',
    'calculate_message_ttl',
    'calculate_dlq_message_ttl',
    'calculate_audit_log_ttl',
    'calculate_rate_limit_ttl',
    'ttl_to_decimal',
    'is_expired',
    'get_ttl_filter_expression',
    'get_ttl_filter_values',
    'TTL_MESSAGES',
    'TTL_DLQ_MESSAGES',
    'TTL_AUDIT_LOGS',
    'TTL_RATE_LIMIT_TRACKERS',
    'EnvironmentValidator',
    'validate_environment',
    'get_send_mode',
    'is_live_mode',
    'is_dry_run_mode',
    'EnvValidationResult',
]
