import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * WECARE.DIGITAL DynamoDB Schema
 * 
 * 11 Tables with PAY_PER_REQUEST billing mode
 * TTL enabled on: Messages (30d), DLQMessages (7d), AuditLogs (180d), RateLimitTrackers (24h)
 */
const schema = a.schema({
  // Table 1: Contacts - Contact records with opt-in preferences
  // Requirement 3.2: Default Block Rule - allowlist fields required
  Contact: a
    .model({
      contactId: a.id().required(),
      name: a.string(),
      phone: a.string(),
      email: a.string(),
      // Opt-in fields (Requirement 3.2: defaults to false)
      optInWhatsApp: a.boolean().default(false),
      optInSms: a.boolean().default(false),
      optInEmail: a.boolean().default(false),
      // Allowlist fields (Requirement 3.2: defaults to false)
      allowlistWhatsApp: a.boolean().default(false),
      allowlistSms: a.boolean().default(false),
      allowlistEmail: a.boolean().default(false),
      lastInboundMessageAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      deletedAt: a.datetime(),
    })
    .identifier(['contactId'])
    .secondaryIndexes((index) => [
      index('phone'),
      index('email'),
    ])
    .authorization((allow) => [allow.authenticated()]),

  // Table 2: Messages - All inbound/outbound messages (TTL: 30 days)
  Message: a
    .model({
      messageId: a.id().required(),
      contactId: a.string().required(),
      channel: a.enum(['WHATSAPP', 'SMS', 'EMAIL']),
      direction: a.enum(['INBOUND', 'OUTBOUND']),
      content: a.string(),
      timestamp: a.datetime(),
      status: a.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']),
      errorDetails: a.string(),
      whatsappMessageId: a.string(),
      mediaId: a.string(),
      expiresAt: a.integer(), // TTL: Unix epoch seconds (30 days)
    })
    .identifier(['messageId'])
    .secondaryIndexes((index) => [
      index('contactId'),
      index('whatsappMessageId'),
    ])
    .authorization((allow) => [allow.authenticated()]),

  // Table 3: BulkJobs - Bulk messaging job tracking
  BulkJob: a
    .model({
      jobId: a.id().required(),
      createdBy: a.string().required(),
      channel: a.enum(['WHATSAPP', 'SMS', 'EMAIL']),
      totalRecipients: a.integer(),
      sentCount: a.integer().default(0),
      failedCount: a.integer().default(0),
      status: a.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .identifier(['jobId'])
    .authorization((allow) => [allow.authenticated()]),

  // Table 4: BulkRecipients - Individual recipient status per job
  BulkRecipient: a
    .model({
      jobId: a.string().required(),
      recipientId: a.string().required(),
      contactId: a.string().required(),
      status: a.enum(['PENDING', 'SENT', 'FAILED']),
      sentAt: a.datetime(),
      errorDetails: a.string(),
    })
    .identifier(['jobId', 'recipientId'])
    .authorization((allow) => [allow.authenticated()]),


  // Table 5: Users - Platform users with RBAC roles
  User: a
    .model({
      userId: a.id().required(),
      email: a.string().required(),
      role: a.enum(['VIEWER', 'OPERATOR', 'ADMIN']),
      createdAt: a.datetime(),
      lastLoginAt: a.datetime(),
    })
    .identifier(['userId'])
    .secondaryIndexes((index) => [index('email')])
    .authorization((allow) => [allow.authenticated()]),

  // Table 6: MediaFiles - WhatsApp media metadata
  MediaFile: a
    .model({
      fileId: a.id().required(),
      messageId: a.string().required(),
      s3Key: a.string().required(),
      contentType: a.string(),
      size: a.integer(),
      uploadedAt: a.datetime(),
      whatsappMediaId: a.string(),
    })
    .identifier(['fileId'])
    .secondaryIndexes((index) => [index('messageId')])
    .authorization((allow) => [allow.authenticated()]),

  // Table 7: DLQMessages - Failed message retry queue (TTL: 7 days)
  DLQMessage: a
    .model({
      dlqMessageId: a.id().required(),
      originalMessageId: a.string(),
      queueName: a.string().required(),
      retryCount: a.integer().default(0),
      lastAttemptAt: a.datetime(),
      payload: a.string(),
      expiresAt: a.integer(), // TTL: Unix epoch seconds (7 days)
    })
    .identifier(['dlqMessageId'])
    .authorization((allow) => [allow.authenticated()]),

  // Table 8: AuditLogs - System audit trail (TTL: 180 days)
  AuditLog: a
    .model({
      logId: a.id().required(),
      userId: a.string(),
      action: a.string().required(),
      resourceType: a.string(),
      resourceId: a.string(),
      timestamp: a.datetime(),
      details: a.string(),
      expiresAt: a.integer(), // TTL: Unix epoch seconds (180 days)
    })
    .identifier(['logId'])
    .authorization((allow) => [allow.authenticated()]),

  // Table 9: AIInteractions - AI query/response logs
  AIInteraction: a
    .model({
      interactionId: a.id().required(),
      messageId: a.string(),
      query: a.string(),
      response: a.string(),
      approved: a.boolean().default(false),
      feedback: a.string(),
      timestamp: a.datetime(),
    })
    .identifier(['interactionId'])
    .secondaryIndexes((index) => [index('messageId')])
    .authorization((allow) => [allow.authenticated()]),

  // Table 10: RateLimitTrackers - Rate limiting counters (TTL: 24 hours)
  RateLimitTracker: a
    .model({
      channel: a.string().required(),
      windowStart: a.string().required(),
      messageCount: a.integer().default(0),
      lastUpdatedAt: a.integer(), // TTL: Unix epoch seconds (24 hours)
    })
    .identifier(['channel', 'windowStart'])
    .authorization((allow) => [allow.authenticated()]),

  // Table 11: SystemConfig - System configuration key-value store
  SystemConfig: a
    .model({
      configKey: a.string().required(),
      configValue: a.string(),
      updatedBy: a.string(),
      updatedAt: a.datetime(),
    })
    .identifier(['configKey'])
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
  // DynamoDB billing mode: PAY_PER_REQUEST (on-demand)
});
