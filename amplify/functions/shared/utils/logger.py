"""
Logging Utility Module

Provides structured CloudWatch logging with JSON format
for all Lambda functions.

Requirements: 3.6, 14.1, 14.2, 14.3
"""

import os
import json
import logging
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum


class LogLevel(Enum):
    """Log levels."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Logger:
    """
    Structured JSON logger for CloudWatch.
    
    All logs are formatted as JSON for easy parsing and querying
    in CloudWatch Logs Insights.
    
    Requirements:
    - 3.6: Log validation failures with contactId, channel, reason
    - 14.1: Log authentication attempts
    - 14.2: Log message validation failures
    - 14.3: Log API errors with request ID, error type, stack trace
    """

    LOG_GROUP = os.environ.get('LOG_GROUP', '/base-wecare-digital/common')

    def __init__(self, name: str = None, level: str = None):
        """
        Initialize Logger.
        
        Args:
            name: Logger name (defaults to module name)
            level: Log level (defaults to LOG_LEVEL env var or INFO)
        """
        self.name = name or __name__
        self.level = level or os.environ.get('LOG_LEVEL', 'INFO')
        
        # Configure Python logger
        self._logger = logging.getLogger(self.name)
        self._logger.setLevel(getattr(logging, self.level, logging.INFO))
        
        # Add handler if not already configured
        if not self._logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter('%(message)s'))
            self._logger.addHandler(handler)

    def _format_log(
        self,
        level: LogLevel,
        message: str,
        **kwargs
    ) -> str:
        """Format log entry as JSON."""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': level.value,
            'logger': self.name,
            'message': message,
            **kwargs
        }
        return json.dumps(log_entry, default=str)

    def debug(self, message: str, **kwargs):
        """Log debug message."""
        self._logger.debug(self._format_log(LogLevel.DEBUG, message, **kwargs))

    def info(self, message: str, **kwargs):
        """Log info message."""
        self._logger.info(self._format_log(LogLevel.INFO, message, **kwargs))

    def warning(self, message: str, **kwargs):
        """Log warning message."""
        self._logger.warning(self._format_log(LogLevel.WARNING, message, **kwargs))

    def error(self, message: str, **kwargs):
        """Log error message."""
        self._logger.error(self._format_log(LogLevel.ERROR, message, **kwargs))

    def critical(self, message: str, **kwargs):
        """Log critical message."""
        self._logger.critical(self._format_log(LogLevel.CRITICAL, message, **kwargs))


# Global logger instance
_default_logger = Logger('wecare-digital')


def log_validation_failure(
    contact_id: str,
    channel: str,
    reason: str,
    details: Dict[str, Any] = None
) -> None:
    """
    Log message validation failure.
    
    Requirement 3.6: Log all validation failures with contactId, channel, and reason
    Requirement 14.2: Log all message validation failures
    
    Args:
        contact_id: Contact ID that failed validation
        channel: Messaging channel (WHATSAPP, SMS, EMAIL)
        reason: Failure reason
        details: Additional details
    """
    _default_logger.warning(
        "Message validation failed",
        event_type="VALIDATION_FAILURE",
        contactId=contact_id,
        channel=channel,
        reason=reason,
        details=details or {}
    )


def log_api_error(
    request_id: str,
    error_type: str,
    error_message: str,
    stack_trace: str = None,
    service: str = None,
    operation: str = None
) -> None:
    """
    Log API error with full details.
    
    Requirement 14.3: Log all API errors with request ID, error type, and stack trace
    
    Args:
        request_id: AWS request ID or correlation ID
        error_type: Type of error (e.g., ThrottlingException)
        error_message: Error message
        stack_trace: Full stack trace (optional)
        service: AWS service name (optional)
        operation: API operation name (optional)
    """
    _default_logger.error(
        "API error occurred",
        event_type="API_ERROR",
        requestId=request_id,
        errorType=error_type,
        errorMessage=error_message,
        stackTrace=stack_trace or traceback.format_exc(),
        service=service,
        operation=operation
    )


def log_authentication_attempt(
    user_id: str,
    email: str = None,
    result: str = "SUCCESS",
    reason: str = None,
    ip_address: str = None
) -> None:
    """
    Log authentication attempt.
    
    Requirement 14.1: Log all authentication attempts
    
    Args:
        user_id: User ID attempting authentication
        email: User email (optional)
        result: Result (SUCCESS, FAILURE, BLOCKED)
        reason: Failure reason if applicable
        ip_address: Client IP address (optional)
    """
    log_level = LogLevel.INFO if result == "SUCCESS" else LogLevel.WARNING
    
    log_entry = {
        'event_type': "AUTHENTICATION_ATTEMPT",
        'userId': user_id,
        'email': email,
        'result': result,
        'reason': reason,
        'ipAddress': ip_address,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    if result == "SUCCESS":
        _default_logger.info("Authentication successful", **log_entry)
    else:
        _default_logger.warning("Authentication failed", **log_entry)


def log_message_sent(
    message_id: str,
    contact_id: str,
    channel: str,
    status: str,
    send_mode: str = None
) -> None:
    """
    Log message sent event.
    
    Args:
        message_id: Message ID
        contact_id: Recipient contact ID
        channel: Messaging channel
        status: Delivery status
        send_mode: Always LIVE in production
    """
    _default_logger.info(
        "Message sent",
        event_type="MESSAGE_SENT",
        messageId=message_id,
        contactId=contact_id,
        channel=channel,
        status=status,
        sendMode=send_mode or os.environ.get('SEND_MODE', 'LIVE')
    )


def log_bulk_job_event(
    job_id: str,
    event: str,
    total_recipients: int = None,
    sent_count: int = None,
    failed_count: int = None,
    status: str = None
) -> None:
    """
    Log bulk job event.
    
    Args:
        job_id: Bulk job ID
        event: Event type (CREATED, STARTED, PROGRESS, COMPLETED, FAILED)
        total_recipients: Total number of recipients
        sent_count: Number sent successfully
        failed_count: Number failed
        status: Job status
    """
    _default_logger.info(
        f"Bulk job {event.lower()}",
        event_type=f"BULK_JOB_{event}",
        jobId=job_id,
        totalRecipients=total_recipients,
        sentCount=sent_count,
        failedCount=failed_count,
        status=status
    )


def log_dlq_event(
    message_id: str,
    queue_name: str,
    event: str,
    retry_count: int = None,
    error: str = None
) -> None:
    """
    Log DLQ event.
    
    Args:
        message_id: Message ID
        queue_name: DLQ name
        event: Event type (ADDED, REPLAYED, EXPIRED)
        retry_count: Current retry count
        error: Error message if applicable
    """
    _default_logger.warning(
        f"DLQ message {event.lower()}",
        event_type=f"DLQ_{event}",
        messageId=message_id,
        queueName=queue_name,
        retryCount=retry_count,
        error=error
    )
