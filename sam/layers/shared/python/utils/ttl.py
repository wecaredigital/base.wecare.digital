"""
TTL (Time-to-Live) Utility Module

Provides TTL calculation for DynamoDB records.
All TTL values are Unix epoch timestamps in seconds (not milliseconds).

Requirements: 17.1, 17.6, 17.7, 17.10

TTL Retention Periods:
- Messages: 30 days (2,592,000 seconds)
- DLQMessages: 7 days (604,800 seconds)
- AuditLogs: 180 days (15,552,000 seconds)
- RateLimitTrackers: 24 hours (86,400 seconds)
"""

import time
from decimal import Decimal
from typing import Union


# TTL retention periods in seconds
TTL_MESSAGES = 30 * 24 * 60 * 60  # 30 days = 2,592,000 seconds
TTL_DLQ_MESSAGES = 7 * 24 * 60 * 60  # 7 days = 604,800 seconds
TTL_AUDIT_LOGS = 180 * 24 * 60 * 60  # 180 days = 15,552,000 seconds
TTL_RATE_LIMIT_TRACKERS = 24 * 60 * 60  # 24 hours = 86,400 seconds


def calculate_ttl(retention_seconds: int, base_time: int = None) -> int:
    """
    Calculate TTL expiration timestamp.
    
    Requirement 17.6: Calculate expiration as current_time + retention_period_seconds
    Requirement 17.1: Return Unix epoch timestamp in seconds (not milliseconds)
    
    Args:
        retention_seconds: Retention period in seconds
        base_time: Base timestamp (defaults to current time)
    
    Returns:
        Unix epoch timestamp in seconds when record should expire
    """
    if base_time is None:
        base_time = int(time.time())
    return base_time + retention_seconds


def calculate_message_ttl(base_time: int = None) -> int:
    """
    Calculate TTL for Messages table (30 days).
    
    Requirement 17.2: Messages table TTL = 30 days
    """
    return calculate_ttl(TTL_MESSAGES, base_time)


def calculate_dlq_message_ttl(base_time: int = None) -> int:
    """
    Calculate TTL for DLQMessages table (7 days).
    
    Requirement 17.3: DLQMessages table TTL = 7 days
    """
    return calculate_ttl(TTL_DLQ_MESSAGES, base_time)


def calculate_audit_log_ttl(base_time: int = None) -> int:
    """
    Calculate TTL for AuditLogs table (180 days).
    
    Requirement 17.4: AuditLogs table TTL = 180 days
    """
    return calculate_ttl(TTL_AUDIT_LOGS, base_time)


def calculate_rate_limit_ttl(base_time: int = None) -> int:
    """
    Calculate TTL for RateLimitTrackers table (24 hours).
    
    Requirement 17.5: RateLimitTrackers table TTL = 24 hours
    """
    return calculate_ttl(TTL_RATE_LIMIT_TRACKERS, base_time)


def ttl_to_decimal(ttl_value: int) -> Decimal:
    """
    Convert TTL value to Decimal for DynamoDB.
    
    Requirement 17.10: TTL attribute values must be Number type
    """
    return Decimal(str(ttl_value))


def is_expired(expires_at: Union[int, Decimal, str]) -> bool:
    """
    Check if a record has expired based on its TTL.
    
    Requirement 17.7: Handle TTL deletion lag by checking expiration in queries
    
    Args:
        expires_at: TTL expiration timestamp
    
    Returns:
        True if record has expired, False otherwise
    """
    if expires_at is None:
        return False
    
    # Convert to int if needed
    if isinstance(expires_at, Decimal):
        expires_at = int(expires_at)
    elif isinstance(expires_at, str):
        expires_at = int(expires_at)
    
    return int(time.time()) >= expires_at


def get_ttl_filter_expression() -> str:
    """
    Get DynamoDB filter expression to exclude expired items.
    
    Requirement 17.7: Implement filter expressions to exclude expired items
    
    Returns:
        Filter expression string for DynamoDB queries
    """
    return 'attribute_not_exists(expiresAt) OR expiresAt > :current_time'


def get_ttl_filter_values() -> dict:
    """
    Get expression attribute values for TTL filter.
    
    Returns:
        Dictionary with :current_time value
    """
    return {':current_time': Decimal(str(int(time.time())))}


# Convenience class for TTL management
class TTLManager:
    """
    TTL Manager for consistent TTL handling across Lambda functions.
    
    Usage:
        ttl_manager = TTLManager()
        record['expiresAt'] = ttl_manager.for_messages()
    """
    
    @staticmethod
    def for_messages() -> Decimal:
        """Get TTL for Messages table."""
        return ttl_to_decimal(calculate_message_ttl())
    
    @staticmethod
    def for_dlq_messages() -> Decimal:
        """Get TTL for DLQMessages table."""
        return ttl_to_decimal(calculate_dlq_message_ttl())
    
    @staticmethod
    def for_audit_logs() -> Decimal:
        """Get TTL for AuditLogs table."""
        return ttl_to_decimal(calculate_audit_log_ttl())
    
    @staticmethod
    def for_rate_limit_trackers() -> Decimal:
        """Get TTL for RateLimitTrackers table."""
        return ttl_to_decimal(calculate_rate_limit_ttl())
    
    @staticmethod
    def is_valid(expires_at: Union[int, Decimal, str]) -> bool:
        """Check if record is still valid (not expired)."""
        return not is_expired(expires_at)
    
    @staticmethod
    def filter_expression() -> str:
        """Get filter expression for queries."""
        return get_ttl_filter_expression()
    
    @staticmethod
    def filter_values() -> dict:
        """Get filter values for queries."""
        return get_ttl_filter_values()
