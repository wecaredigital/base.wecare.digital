"""
WECARE.DIGITAL Shared Utilities

Core utility modules for message validation, rate limiting,
logging, metrics, and error handling.
"""

from .validator import MessageValidator, ValidationResult
from .rate_limiter import RateLimiter
from .logger import Logger, log_validation_failure, log_api_error, log_authentication_attempt
from .metrics import MetricsEmitter
from .error_handler import retry_with_exponential_backoff, send_to_dlq, CircuitBreaker

__all__ = [
    'MessageValidator',
    'ValidationResult',
    'RateLimiter',
    'Logger',
    'log_validation_failure',
    'log_api_error',
    'log_authentication_attempt',
    'MetricsEmitter',
    'retry_with_exponential_backoff',
    'send_to_dlq',
    'CircuitBreaker',
]
