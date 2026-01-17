"""
Error Handling Utilities Module

Provides retry logic with exponential backoff, DLQ handling,
and circuit breaker pattern for external API calls.

Requirements: 4.7, 8.9, 13.8
"""

import os
import time
import json
import random
import logging
import functools
from typing import Callable, Any, Dict, Optional, List
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "CLOSED"      # Normal operation
    OPEN = "OPEN"          # Failing, reject requests
    HALF_OPEN = "HALF_OPEN"  # Testing if service recovered


@dataclass
class RetryConfig:
    """Configuration for retry with exponential backoff."""
    max_retries: int = 3
    base_delay_seconds: float = 1.0
    max_delay_seconds: float = 30.0
    exponential_base: float = 2.0
    jitter: bool = True
    retryable_exceptions: tuple = (Exception,)


def retry_with_exponential_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    retryable_exceptions: tuple = None
) -> Callable:
    """
    Decorator for retry with exponential backoff.
    
    Requirement 13.8: Implement exponential backoff for API retry
    attempts with maximum 3 retries.
    
    Args:
        max_retries: Maximum number of retry attempts (default 3)
        base_delay: Initial delay in seconds (default 1.0)
        max_delay: Maximum delay in seconds (default 30.0)
        retryable_exceptions: Tuple of exceptions to retry on
        
    Returns:
        Decorated function with retry logic
    """
    if retryable_exceptions is None:
        retryable_exceptions = (Exception,)
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        logger.error(
                            f"Max retries ({max_retries}) exceeded for {func.__name__}",
                            extra={'error': str(e), 'attempts': attempt + 1}
                        )
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    
                    # Add jitter (±25%)
                    jitter = delay * 0.25 * (random.random() * 2 - 1)
                    delay = max(0, delay + jitter)
                    
                    logger.warning(
                        f"Retry {attempt + 1}/{max_retries} for {func.__name__} "
                        f"after {delay:.2f}s delay",
                        extra={'error': str(e), 'delay': delay}
                    )
                    
                    time.sleep(delay)
            
            raise last_exception
        
        return wrapper
    return decorator


def send_to_dlq(
    message: Dict[str, Any],
    queue_name: str,
    error: str,
    sqs_client=None,
    retry_count: int = 0
) -> bool:
    """
    Send failed message to Dead Letter Queue.
    
    Requirement 4.7: Send failed inbound messages to inbound-dlq
    Requirement 8.9: Send failed bulk chunks to bulk-dlq
    
    Args:
        message: Original message payload
        queue_name: DLQ name (inbound-dlq, bulk-dlq, outbound-dlq)
        error: Error message/reason
        sqs_client: Boto3 SQS client (optional)
        retry_count: Current retry count
        
    Returns:
        True if successfully sent to DLQ, False otherwise
    """
    import uuid
    
    dlq_message = {
        'dlqMessageId': str(uuid.uuid4()),
        'originalMessageId': message.get('messageId') or message.get('id'),
        'queueName': queue_name,
        'retryCount': retry_count,
        'lastAttemptAt': datetime.utcnow().isoformat(),
        'error': error,
        'payload': json.dumps(message),
        # TTL: 7 days in seconds
        'expiresAt': int(time.time()) + (7 * 24 * 60 * 60)
    }
    
    logger.warning(
        f"Sending message to DLQ: {queue_name}",
        extra={
            'dlqMessageId': dlq_message['dlqMessageId'],
            'originalMessageId': dlq_message['originalMessageId'],
            'retryCount': retry_count,
            'error': error
        }
    )
    
    if not sqs_client:
        # Log only if no SQS client (for testing)
        logger.info(f"DLQ message (no client): {json.dumps(dlq_message)}")
        return True
    
    try:
        queue_url = os.environ.get(f'{queue_name.upper().replace("-", "_")}_URL')
        if not queue_url:
            logger.error(f"DLQ URL not configured for {queue_name}")
            return False
        
        sqs_client.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(dlq_message),
            MessageAttributes={
                'RetryCount': {
                    'DataType': 'Number',
                    'StringValue': str(retry_count)
                },
                'OriginalQueue': {
                    'DataType': 'String',
                    'StringValue': queue_name
                }
            }
        )
        return True
        
    except Exception as e:
        logger.error(f"Failed to send to DLQ {queue_name}: {str(e)}")
        return False


@dataclass
class CircuitBreaker:
    """
    Circuit breaker for external API calls.
    
    Prevents cascading failures by temporarily blocking requests
    to failing services.
    
    States:
    - CLOSED: Normal operation, requests pass through
    - OPEN: Service failing, requests rejected immediately
    - HALF_OPEN: Testing if service recovered
    """
    
    name: str
    failure_threshold: int = 5
    recovery_timeout_seconds: int = 30
    half_open_max_calls: int = 3
    
    # Internal state
    _state: CircuitState = field(default=CircuitState.CLOSED, init=False)
    _failure_count: int = field(default=0, init=False)
    _last_failure_time: Optional[float] = field(default=None, init=False)
    _half_open_calls: int = field(default=0, init=False)
    _half_open_successes: int = field(default=0, init=False)

    @property
    def state(self) -> CircuitState:
        """Get current circuit state, checking for recovery."""
        if self._state == CircuitState.OPEN:
            if self._should_attempt_recovery():
                self._state = CircuitState.HALF_OPEN
                self._half_open_calls = 0
                self._half_open_successes = 0
        return self._state

    def _should_attempt_recovery(self) -> bool:
        """Check if enough time has passed to attempt recovery."""
        if self._last_failure_time is None:
            return True
        elapsed = time.time() - self._last_failure_time
        return elapsed >= self.recovery_timeout_seconds

    def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function through circuit breaker.
        
        Args:
            func: Function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            CircuitBreakerOpenError: If circuit is open
            Original exception: If function fails
        """
        state = self.state
        
        if state == CircuitState.OPEN:
            raise CircuitBreakerOpenError(
                f"Circuit breaker '{self.name}' is OPEN. "
                f"Retry after {self.recovery_timeout_seconds}s"
            )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self) -> None:
        """Handle successful call."""
        if self._state == CircuitState.HALF_OPEN:
            self._half_open_successes += 1
            self._half_open_calls += 1
            
            # If enough successful calls, close circuit
            if self._half_open_successes >= self.half_open_max_calls:
                logger.info(f"Circuit breaker '{self.name}' recovered, closing")
                self._state = CircuitState.CLOSED
                self._failure_count = 0
        else:
            # Reset failure count on success in closed state
            self._failure_count = 0

    def _on_failure(self) -> None:
        """Handle failed call."""
        self._failure_count += 1
        self._last_failure_time = time.time()
        
        if self._state == CircuitState.HALF_OPEN:
            # Any failure in half-open state opens circuit
            logger.warning(f"Circuit breaker '{self.name}' failed in HALF_OPEN, reopening")
            self._state = CircuitState.OPEN
        elif self._failure_count >= self.failure_threshold:
            logger.warning(
                f"Circuit breaker '{self.name}' opened after "
                f"{self._failure_count} failures"
            )
            self._state = CircuitState.OPEN

    def reset(self) -> None:
        """Manually reset circuit breaker to closed state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time = None
        self._half_open_calls = 0
        self._half_open_successes = 0


class CircuitBreakerOpenError(Exception):
    """Raised when circuit breaker is open."""
    pass


# Pre-configured circuit breakers for AWS services
class ServiceCircuitBreakers:
    """Collection of circuit breakers for AWS services."""
    
    _breakers: Dict[str, CircuitBreaker] = {}
    
    @classmethod
    def get(cls, service_name: str) -> CircuitBreaker:
        """Get or create circuit breaker for a service."""
        if service_name not in cls._breakers:
            cls._breakers[service_name] = CircuitBreaker(
                name=service_name,
                failure_threshold=5,
                recovery_timeout_seconds=30
            )
        return cls._breakers[service_name]
    
    @classmethod
    def whatsapp(cls) -> CircuitBreaker:
        """Circuit breaker for WhatsApp API."""
        return cls.get('whatsapp-api')
    
    @classmethod
    def sms(cls) -> CircuitBreaker:
        """Circuit breaker for SMS (Pinpoint)."""
        return cls.get('pinpoint-sms')
    
    @classmethod
    def email(cls) -> CircuitBreaker:
        """Circuit breaker for Email (SES)."""
        return cls.get('ses-email')
    
    @classmethod
    def bedrock(cls) -> CircuitBreaker:
        """Circuit breaker for Bedrock AI."""
        return cls.get('bedrock-ai')
