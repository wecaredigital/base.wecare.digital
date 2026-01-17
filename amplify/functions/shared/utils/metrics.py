"""
Metrics Utility Module

Provides CloudWatch metrics emission for monitoring
message delivery rates, bulk job performance, and system health.

Requirements: 14.4, 14.5
"""

import os
import time
import logging
from typing import Dict, Any, List, Optional
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)


class MetricUnit(Enum):
    """CloudWatch metric units."""
    COUNT = "Count"
    SECONDS = "Seconds"
    MILLISECONDS = "Milliseconds"
    PERCENT = "Percent"
    BYTES = "Bytes"


@dataclass
class Metric:
    """CloudWatch metric data point."""
    name: str
    value: float
    unit: MetricUnit
    dimensions: Dict[str, str] = None
    timestamp: float = None

    def to_cloudwatch_format(self) -> Dict[str, Any]:
        """Convert to CloudWatch PutMetricData format."""
        metric_data = {
            'MetricName': self.name,
            'Value': self.value,
            'Unit': self.unit.value,
        }
        
        if self.dimensions:
            metric_data['Dimensions'] = [
                {'Name': k, 'Value': v}
                for k, v in self.dimensions.items()
            ]
        
        if self.timestamp:
            from datetime import datetime
            metric_data['Timestamp'] = datetime.fromtimestamp(self.timestamp)
        
        return metric_data


class MetricsEmitter:
    """
    CloudWatch metrics emitter for WECARE.DIGITAL platform.
    
    Emits custom metrics for:
    - Message delivery success/failure rates per channel
    - Bulk job processing duration and throughput
    - Rate limit usage
    - DLQ depth
    
    Requirements:
    - 14.4: Emit CloudWatch metrics for message delivery success/failure rates
    - 14.5: Emit CloudWatch metrics for bulk job processing duration and throughput
    """

    NAMESPACE = "WECARE.DIGITAL"
    
    def __init__(self, cloudwatch_client=None):
        """
        Initialize MetricsEmitter.
        
        Args:
            cloudwatch_client: Boto3 CloudWatch client (optional, for testing)
        """
        self.cloudwatch = cloudwatch_client
        self._metric_buffer: List[Metric] = []
        self._buffer_size = int(os.environ.get('METRICS_BUFFER_SIZE', 20))

    def emit_message_delivery_metric(
        self,
        channel: str,
        status: str,
        count: int = 1
    ) -> None:
        """
        Emit message delivery metric.
        
        Requirement 14.4: Emit CloudWatch metrics for message delivery
        success and failure rates per channel.
        
        Args:
            channel: Messaging channel (WHATSAPP, SMS, EMAIL)
            status: Delivery status (SUCCESS, FAILED, PENDING)
            count: Number of messages (default 1)
        """
        metric = Metric(
            name=f"Messages{status.capitalize()}",
            value=count,
            unit=MetricUnit.COUNT,
            dimensions={
                'Channel': channel,
                'Status': status
            },
            timestamp=time.time()
        )
        self._emit_metric(metric)
        
        # Also emit total messages metric
        total_metric = Metric(
            name="MessagesTotal",
            value=count,
            unit=MetricUnit.COUNT,
            dimensions={'Channel': channel},
            timestamp=time.time()
        )
        self._emit_metric(total_metric)

    def emit_bulk_job_metric(
        self,
        job_id: str,
        duration_seconds: float = None,
        throughput_per_second: float = None,
        total_recipients: int = None,
        sent_count: int = None,
        failed_count: int = None
    ) -> None:
        """
        Emit bulk job metrics.
        
        Requirement 14.5: Emit CloudWatch metrics for bulk job
        processing duration and throughput.
        
        Args:
            job_id: Bulk job ID
            duration_seconds: Total processing duration
            throughput_per_second: Messages processed per second
            total_recipients: Total number of recipients
            sent_count: Successfully sent count
            failed_count: Failed count
        """
        timestamp = time.time()
        
        if duration_seconds is not None:
            self._emit_metric(Metric(
                name="BulkJobDuration",
                value=duration_seconds,
                unit=MetricUnit.SECONDS,
                dimensions={'JobId': job_id},
                timestamp=timestamp
            ))
        
        if throughput_per_second is not None:
            self._emit_metric(Metric(
                name="BulkJobThroughput",
                value=throughput_per_second,
                unit=MetricUnit.COUNT,
                dimensions={'JobId': job_id},
                timestamp=timestamp
            ))
        
        if total_recipients is not None:
            self._emit_metric(Metric(
                name="BulkJobRecipients",
                value=total_recipients,
                unit=MetricUnit.COUNT,
                dimensions={'JobId': job_id},
                timestamp=timestamp
            ))
        
        if sent_count is not None:
            self._emit_metric(Metric(
                name="BulkJobSent",
                value=sent_count,
                unit=MetricUnit.COUNT,
                dimensions={'JobId': job_id},
                timestamp=timestamp
            ))
        
        if failed_count is not None:
            self._emit_metric(Metric(
                name="BulkJobFailed",
                value=failed_count,
                unit=MetricUnit.COUNT,
                dimensions={'JobId': job_id},
                timestamp=timestamp
            ))
        
        # Calculate success rate if both counts available
        if sent_count is not None and failed_count is not None:
            total = sent_count + failed_count
            if total > 0:
                success_rate = (sent_count / total) * 100
                self._emit_metric(Metric(
                    name="BulkJobSuccessRate",
                    value=success_rate,
                    unit=MetricUnit.PERCENT,
                    dimensions={'JobId': job_id},
                    timestamp=timestamp
                ))

    def emit_validation_failure_metric(
        self,
        channel: str,
        reason: str
    ) -> None:
        """
        Emit validation failure metric.
        
        Args:
            channel: Messaging channel
            reason: Failure reason (OPT_IN_REQUIRED, ALLOWLIST_VIOLATION, etc.)
        """
        self._emit_metric(Metric(
            name="ValidationFailures",
            value=1,
            unit=MetricUnit.COUNT,
            dimensions={
                'Channel': channel,
                'Reason': reason
            },
            timestamp=time.time()
        ))

    def emit_rate_limit_metric(
        self,
        channel: str,
        usage_percent: float
    ) -> None:
        """
        Emit rate limit usage metric.
        
        Args:
            channel: Messaging channel
            usage_percent: Current usage as percentage of limit
        """
        self._emit_metric(Metric(
            name="RateLimitUsage",
            value=usage_percent,
            unit=MetricUnit.PERCENT,
            dimensions={'Channel': channel},
            timestamp=time.time()
        ))

    def emit_dlq_depth_metric(
        self,
        queue_name: str,
        depth: int
    ) -> None:
        """
        Emit DLQ depth metric.
        
        Args:
            queue_name: DLQ name
            depth: Number of messages in queue
        """
        self._emit_metric(Metric(
            name="DLQDepth",
            value=depth,
            unit=MetricUnit.COUNT,
            dimensions={'QueueName': queue_name},
            timestamp=time.time()
        ))

    def emit_api_latency_metric(
        self,
        service: str,
        operation: str,
        latency_ms: float
    ) -> None:
        """
        Emit API latency metric.
        
        Args:
            service: AWS service name
            operation: API operation name
            latency_ms: Latency in milliseconds
        """
        self._emit_metric(Metric(
            name="APILatency",
            value=latency_ms,
            unit=MetricUnit.MILLISECONDS,
            dimensions={
                'Service': service,
                'Operation': operation
            },
            timestamp=time.time()
        ))

    def emit_tier_limit_metric(
        self,
        tier: int,
        usage_count: int,
        limit: int
    ) -> None:
        """
        Emit WhatsApp tier limit usage metric.
        
        Args:
            tier: Current WhatsApp business tier
            usage_count: Current conversation count
            limit: Tier limit
        """
        usage_percent = (usage_count / limit * 100) if limit > 0 else 0
        
        self._emit_metric(Metric(
            name="WhatsAppTierUsage",
            value=usage_count,
            unit=MetricUnit.COUNT,
            dimensions={'Tier': str(tier)},
            timestamp=time.time()
        ))
        
        self._emit_metric(Metric(
            name="WhatsAppTierUsagePercent",
            value=usage_percent,
            unit=MetricUnit.PERCENT,
            dimensions={'Tier': str(tier)},
            timestamp=time.time()
        ))

    def _emit_metric(self, metric: Metric) -> None:
        """Add metric to buffer and flush if needed."""
        self._metric_buffer.append(metric)
        
        if len(self._metric_buffer) >= self._buffer_size:
            self.flush()

    def flush(self) -> None:
        """Flush buffered metrics to CloudWatch."""
        if not self._metric_buffer:
            return
        
        if not self.cloudwatch:
            # Log metrics locally if no CloudWatch client
            for metric in self._metric_buffer:
                logger.info(f"Metric: {metric.name}={metric.value} {metric.unit.value} {metric.dimensions}")
            self._metric_buffer.clear()
            return
        
        try:
            # Convert to CloudWatch format
            metric_data = [m.to_cloudwatch_format() for m in self._metric_buffer]
            
            # CloudWatch allows max 20 metrics per call
            for i in range(0, len(metric_data), 20):
                batch = metric_data[i:i+20]
                self.cloudwatch.put_metric_data(
                    Namespace=self.NAMESPACE,
                    MetricData=batch
                )
            
            self._metric_buffer.clear()
            
        except Exception as e:
            logger.error(f"Failed to emit metrics: {str(e)}")
            # Keep metrics in buffer for retry
