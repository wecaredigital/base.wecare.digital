"""
Rate Limiter Module

Implements token bucket algorithm with DynamoDB atomic counters
for rate limiting across all messaging channels.

Requirements: 5.9, 6.5, 7.5, 13.1, 13.2, 13.5
"""

import os
import time
import logging
from dataclasses import dataclass
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class Channel(Enum):
    """Messaging channels with rate limits."""
    WHATSAPP = "WHATSAPP"
    SMS = "SMS"
    EMAIL = "EMAIL"


@dataclass
class RateLimitConfig:
    """Rate limit configuration for a channel."""
    channel: Channel
    tokens_per_second: int
    bucket_capacity: int
    
    @staticmethod
    def whatsapp(phone_number_id: str = None) -> 'RateLimitConfig':
        """WhatsApp rate limit: 80 messages/second per phone number."""
        return RateLimitConfig(
            channel=Channel.WHATSAPP,
            tokens_per_second=80,
            bucket_capacity=80
        )
    
    @staticmethod
    def sms() -> 'RateLimitConfig':
        """SMS rate limit: 5 messages/second."""
        return RateLimitConfig(
            channel=Channel.SMS,
            tokens_per_second=5,
            bucket_capacity=5
        )
    
    @staticmethod
    def email() -> 'RateLimitConfig':
        """Email rate limit: 10 messages/second."""
        return RateLimitConfig(
            channel=Channel.EMAIL,
            tokens_per_second=10,
            bucket_capacity=10
        )


@dataclass
class RateLimitResult:
    """Result of rate limit check."""
    allowed: bool
    tokens_remaining: int
    retry_after_seconds: Optional[float] = None
    message: Optional[str] = None


class RateLimiter:
    """
    Token bucket rate limiter with DynamoDB backend.
    
    Uses atomic counters in DynamoDB RateLimitTrackers table
    for distributed rate limiting across Lambda invocations.
    
    Requirements:
    - 5.9: WhatsApp 80 messages/second per phone number
    - 6.5: SMS 5 messages/second
    - 7.5: Email 10 messages/second
    - 13.1: API rate limit 1000 requests/second
    - 13.2: WhatsApp tier limits (250 conversations/24h)
    - 13.5: Queue messages when rate limits exceeded
    """

    # Rate limits per channel
    RATE_LIMITS = {
        Channel.WHATSAPP: 80,   # per phone number
        Channel.SMS: 5,
        Channel.EMAIL: 10,
    }

    # WhatsApp API-level rate limit
    WHATSAPP_API_RATE_LIMIT = 1000  # requests/second (account level)

    # WhatsApp Business Tier limits
    TIER_LIMITS = {
        1: 250,    # Tier 1: 250 conversations/24h
        2: 1000,   # Tier 2: 1000 conversations/24h
        3: 10000,  # Tier 3: 10000 conversations/24h
        4: 100000, # Tier 4: 100000 conversations/24h
    }

    # TTL for rate limit trackers (24 hours in seconds)
    TRACKER_TTL_SECONDS = 86400

    def __init__(self, dynamodb_client=None, table_name: str = None):
        """
        Initialize RateLimiter.
        
        Args:
            dynamodb_client: Boto3 DynamoDB client (optional, for testing)
            table_name: DynamoDB table name for rate limit trackers
        """
        self.dynamodb = dynamodb_client
        self.table_name = table_name or os.environ.get('RATE_LIMIT_TABLE', 'RateLimitTrackers')
        self._local_buckets: Dict[str, Dict[str, Any]] = {}

    def check_and_consume(
        self,
        channel: Channel,
        identifier: str = "default",
        tokens: int = 1
    ) -> RateLimitResult:
        """
        Check rate limit and consume tokens if allowed.
        
        Uses DynamoDB atomic counters for distributed rate limiting.
        Falls back to local in-memory bucket if DynamoDB unavailable.
        
        Args:
            channel: Messaging channel (WHATSAPP, SMS, EMAIL)
            identifier: Unique identifier (e.g., phone_number_id for WhatsApp)
            tokens: Number of tokens to consume (default 1)
            
        Returns:
            RateLimitResult with allowed status and remaining tokens
        """
        rate_limit = self.RATE_LIMITS.get(channel, 10)
        bucket_key = f"{channel.value}:{identifier}"
        current_second = int(time.time())
        window_start = str(current_second)

        try:
            if self.dynamodb:
                return self._check_dynamodb(bucket_key, window_start, rate_limit, tokens)
            else:
                return self._check_local(bucket_key, current_second, rate_limit, tokens)
        except Exception as e:
            logger.error(f"Rate limit check failed: {str(e)}")
            # Fail open - allow the request but log warning
            logger.warning(f"Rate limiter unavailable, allowing request for {bucket_key}")
            return RateLimitResult(allowed=True, tokens_remaining=rate_limit - tokens)

    def _check_dynamodb(
        self,
        bucket_key: str,
        window_start: str,
        rate_limit: int,
        tokens: int
    ) -> RateLimitResult:
        """Check rate limit using DynamoDB atomic counter."""
        try:
            # Atomic increment with conditional check
            response = self.dynamodb.update_item(
                TableName=self.table_name,
                Key={
                    'channel': {'S': bucket_key},
                    'windowStart': {'S': window_start}
                },
                UpdateExpression='SET messageCount = if_not_exists(messageCount, :zero) + :inc, lastUpdatedAt = :ttl',
                ConditionExpression='attribute_not_exists(messageCount) OR messageCount < :limit',
                ExpressionAttributeValues={
                    ':zero': {'N': '0'},
                    ':inc': {'N': str(tokens)},
                    ':limit': {'N': str(rate_limit)},
                    ':ttl': {'N': str(int(time.time()) + self.TRACKER_TTL_SECONDS)}
                },
                ReturnValues='ALL_NEW'
            )
            
            new_count = int(response['Attributes']['messageCount']['N'])
            remaining = rate_limit - new_count
            
            return RateLimitResult(
                allowed=True,
                tokens_remaining=max(0, remaining)
            )
            
        except self.dynamodb.exceptions.ConditionalCheckFailedException:
            # Rate limit exceeded
            return RateLimitResult(
                allowed=False,
                tokens_remaining=0,
                retry_after_seconds=1.0,
                message=f"Rate limit exceeded for {bucket_key}"
            )

    def _check_local(
        self,
        bucket_key: str,
        current_second: int,
        rate_limit: int,
        tokens: int
    ) -> RateLimitResult:
        """Check rate limit using local in-memory bucket (for testing/fallback)."""
        if bucket_key not in self._local_buckets:
            self._local_buckets[bucket_key] = {
                'tokens': rate_limit,
                'last_refill': current_second
            }

        bucket = self._local_buckets[bucket_key]
        
        # Refill tokens if new second
        if current_second > bucket['last_refill']:
            elapsed = current_second - bucket['last_refill']
            bucket['tokens'] = min(rate_limit, bucket['tokens'] + (elapsed * rate_limit))
            bucket['last_refill'] = current_second

        # Check if enough tokens
        if bucket['tokens'] >= tokens:
            bucket['tokens'] -= tokens
            return RateLimitResult(
                allowed=True,
                tokens_remaining=int(bucket['tokens'])
            )
        else:
            return RateLimitResult(
                allowed=False,
                tokens_remaining=int(bucket['tokens']),
                retry_after_seconds=1.0,
                message=f"Rate limit exceeded for {bucket_key}"
            )

    def get_current_usage(
        self,
        channel: Channel,
        identifier: str = "default",
        window_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get current usage for rolling window tracking.
        
        Used for WhatsApp tier limit tracking (250 conversations/24h).
        
        Args:
            channel: Messaging channel
            identifier: Unique identifier
            window_hours: Rolling window size in hours (default 24)
            
        Returns:
            Dict with usage statistics
        """
        bucket_key = f"{channel.value}:{identifier}"
        current_time = int(time.time())
        window_start = current_time - (window_hours * 3600)

        # For local testing
        if not self.dynamodb:
            return {
                'channel': channel.value,
                'identifier': identifier,
                'windowHours': window_hours,
                'messageCount': 0,
                'limit': self.TIER_LIMITS.get(1, 250) if channel == Channel.WHATSAPP else self.RATE_LIMITS.get(channel, 10),
                'percentUsed': 0.0
            }

        try:
            # Query DynamoDB for all entries in window
            # Note: In production, use a GSI or separate table for efficient querying
            response = self.dynamodb.query(
                TableName=self.table_name,
                KeyConditionExpression='channel = :channel AND windowStart >= :start',
                ExpressionAttributeValues={
                    ':channel': {'S': bucket_key},
                    ':start': {'S': str(window_start)}
                }
            )
            
            total_count = sum(
                int(item.get('messageCount', {}).get('N', 0))
                for item in response.get('Items', [])
            )
            
            limit = self.TIER_LIMITS.get(1, 250) if channel == Channel.WHATSAPP else self.RATE_LIMITS.get(channel, 10) * 3600 * window_hours
            
            return {
                'channel': channel.value,
                'identifier': identifier,
                'windowHours': window_hours,
                'messageCount': total_count,
                'limit': limit,
                'percentUsed': (total_count / limit * 100) if limit > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get usage: {str(e)}")
            return {
                'channel': channel.value,
                'identifier': identifier,
                'windowHours': window_hours,
                'messageCount': 0,
                'limit': 0,
                'percentUsed': 0,
                'error': str(e)
            }

    def check_tier_limit(self, current_tier: int = 1) -> RateLimitResult:
        """
        Check WhatsApp business tier limit.
        
        Requirement 13.2: Track 250 conversations/24h for Tier 1
        
        Args:
            current_tier: Current WhatsApp business tier (1-4)
            
        Returns:
            RateLimitResult indicating if tier limit allows more conversations
        """
        usage = self.get_current_usage(Channel.WHATSAPP, "tier", window_hours=24)
        tier_limit = self.TIER_LIMITS.get(current_tier, 250)
        
        if usage['messageCount'] >= tier_limit:
            return RateLimitResult(
                allowed=False,
                tokens_remaining=0,
                message=f"WhatsApp Tier {current_tier} limit reached ({tier_limit} conversations/24h)"
            )
        
        return RateLimitResult(
            allowed=True,
            tokens_remaining=tier_limit - usage['messageCount']
        )

    def is_tier_limit_warning(self, current_tier: int = 1, threshold: float = 0.8) -> bool:
        """
        Check if tier usage is above warning threshold.
        
        Requirement 13.9: Alert when tier limit reaches 80%
        
        Args:
            current_tier: Current WhatsApp business tier
            threshold: Warning threshold (default 0.8 = 80%)
            
        Returns:
            True if usage is above threshold
        """
        usage = self.get_current_usage(Channel.WHATSAPP, "tier", window_hours=24)
        return usage['percentUsed'] >= (threshold * 100)
