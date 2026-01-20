import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { HttpApi, HttpMethod, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Duration } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

// Import Lambda functions
import { authMiddleware } from './functions/auth-middleware/resource';
import { contactsCreate } from './functions/contacts-create/resource';
import { contactsRead } from './functions/contacts-read/resource';
import { contactsUpdate } from './functions/contacts-update/resource';
import { contactsDelete } from './functions/contacts-delete/resource';
import { contactsSearch } from './functions/contacts-search/resource';
import { messagesRead } from './functions/messages-read/resource';
import { inboundWhatsappHandler } from './functions/inbound-whatsapp-handler/resource';
import { outboundWhatsapp } from './functions/outbound-whatsapp/resource';
import { outboundSms } from './functions/outbound-sms/resource';
import { outboundEmail } from './functions/outbound-email/resource';
import { bulkJobCreate } from './functions/bulk-job-create/resource';
import { bulkWorker } from './functions/bulk-worker/resource';
import { bulkJobControl } from './functions/bulk-job-control/resource';
import { dlqReplay } from './functions/dlq-replay/resource';
import { aiQueryKb } from './functions/ai-query-kb/resource';
import { aiGenerateResponse } from './functions/ai-generate-response/resource';
import { outboundVoice } from './functions/outbound-voice/resource';
import { voiceCallsRead } from './functions/voice-calls-read/resource';

/**
 * WECARE.DIGITAL Admin Platform Backend
 * 
 * AWS Account: 809904170947
 * Region: us-east-1
 * 
 * Branch Deployment Strategy:
 * - base → Production (SEND_MODE=LIVE)
 * - feature/* → Preview (SEND_MODE=DRY_RUN)
 * - release/* → Staging (SEND_MODE=DRY_RUN)
 * - hotfix/* → Production (SEND_MODE=LIVE)
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  // Lambda Functions
  authMiddleware,
  contactsCreate,
  contactsRead,
  contactsUpdate,
  contactsDelete,
  contactsSearch,
  messagesRead,
  inboundWhatsappHandler,
  outboundWhatsapp,
  outboundSms,
  outboundEmail,
  bulkJobCreate,
  bulkWorker,
  bulkJobControl,
  dlqReplay,
  aiQueryKb,
  aiGenerateResponse,
  outboundVoice,
  voiceCallsRead,
});

// Create HTTP API for frontend to call Lambda functions
const apiStack = backend.createStack('api-stack');

const httpApi = new HttpApi(apiStack, 'WecareDmApi', {
  apiName: 'wecare-dm-api',
  corsPreflight: {
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS],
    allowOrigins: ['https://base.wecare.digital', 'https://base.dtiq7il2x5c5g.amplifyapp.com', 'http://localhost:3000'],
    maxAge: Duration.days(1),
  },
});

// Contacts API routes
const contactsReadIntegration = new HttpLambdaIntegration('ContactsReadIntegration', backend.contactsRead.resources.lambda);
const contactsCreateIntegration = new HttpLambdaIntegration('ContactsCreateIntegration', backend.contactsCreate.resources.lambda);
const contactsUpdateIntegration = new HttpLambdaIntegration('ContactsUpdateIntegration', backend.contactsUpdate.resources.lambda);
const contactsDeleteIntegration = new HttpLambdaIntegration('ContactsDeleteIntegration', backend.contactsDelete.resources.lambda);
const contactsSearchIntegration = new HttpLambdaIntegration('ContactsSearchIntegration', backend.contactsSearch.resources.lambda);

httpApi.addRoutes({
  path: '/contacts',
  methods: [HttpMethod.GET],
  integration: contactsSearchIntegration,
});

httpApi.addRoutes({
  path: '/contacts',
  methods: [HttpMethod.POST],
  integration: contactsCreateIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [HttpMethod.GET],
  integration: contactsReadIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [HttpMethod.PUT],
  integration: contactsUpdateIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [HttpMethod.DELETE],
  integration: contactsDeleteIntegration,
});

// Messages API routes
const messagesReadIntegration = new HttpLambdaIntegration('MessagesReadIntegration', backend.messagesRead.resources.lambda);

httpApi.addRoutes({
  path: '/messages',
  methods: [HttpMethod.GET],
  integration: messagesReadIntegration,
});

// WhatsApp API routes
const outboundWhatsappIntegration = new HttpLambdaIntegration('OutboundWhatsappIntegration', backend.outboundWhatsapp.resources.lambda);

httpApi.addRoutes({
  path: '/whatsapp/send',
  methods: [HttpMethod.POST],
  integration: outboundWhatsappIntegration,
});

// SMS API routes
const outboundSmsIntegration = new HttpLambdaIntegration('OutboundSmsIntegration', backend.outboundSms.resources.lambda);

httpApi.addRoutes({
  path: '/sms/send',
  methods: [HttpMethod.POST],
  integration: outboundSmsIntegration,
});

// Email API routes
const outboundEmailIntegration = new HttpLambdaIntegration('OutboundEmailIntegration', backend.outboundEmail.resources.lambda);

httpApi.addRoutes({
  path: '/email/send',
  methods: [HttpMethod.POST],
  integration: outboundEmailIntegration,
});

// Bulk Job API routes
const bulkJobCreateIntegration = new HttpLambdaIntegration('BulkJobCreateIntegration', backend.bulkJobCreate.resources.lambda);
const bulkJobControlIntegration = new HttpLambdaIntegration('BulkJobControlIntegration', backend.bulkJobControl.resources.lambda);

httpApi.addRoutes({
  path: '/bulk/jobs',
  methods: [HttpMethod.GET, HttpMethod.POST],
  integration: bulkJobCreateIntegration,
});

httpApi.addRoutes({
  path: '/bulk/jobs/{jobId}',
  methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE],
  integration: bulkJobControlIntegration,
});

// AI API routes
const aiQueryKbIntegration = new HttpLambdaIntegration('AiQueryKbIntegration', backend.aiQueryKb.resources.lambda);
const aiGenerateResponseIntegration = new HttpLambdaIntegration('AiGenerateResponseIntegration', backend.aiGenerateResponse.resources.lambda);

httpApi.addRoutes({
  path: '/ai/query',
  methods: [HttpMethod.POST],
  integration: aiQueryKbIntegration,
});

httpApi.addRoutes({
  path: '/ai/generate',
  methods: [HttpMethod.POST],
  integration: aiGenerateResponseIntegration,
});

// Voice API routes
const outboundVoiceIntegration = new HttpLambdaIntegration('OutboundVoiceIntegration', backend.outboundVoice.resources.lambda);
const voiceCallsReadIntegration = new HttpLambdaIntegration('VoiceCallsReadIntegration', backend.voiceCallsRead.resources.lambda);

httpApi.addRoutes({
  path: '/voice/call',
  methods: [HttpMethod.POST],
  integration: outboundVoiceIntegration,
});

httpApi.addRoutes({
  path: '/voice/calls',
  methods: [HttpMethod.GET],
  integration: voiceCallsReadIntegration,
});

// DLQ API routes
const dlqReplayIntegration = new HttpLambdaIntegration('DlqReplayIntegration', backend.dlqReplay.resources.lambda);

httpApi.addRoutes({
  path: '/dlq',
  methods: [HttpMethod.GET],
  integration: dlqReplayIntegration,
});

httpApi.addRoutes({
  path: '/dlq/replay',
  methods: [HttpMethod.POST],
  integration: dlqReplayIntegration,
});

// Output the API URL
backend.addOutput({
  custom: {
    API: {
      endpoint: httpApi.url,
    },
  },
});

// ============================================================================
// SNS SUBSCRIPTION FOR INBOUND WHATSAPP
// Critical: Without this, inbound WhatsApp messages never reach the handler
// ============================================================================

const snsStack = backend.createStack('sns-subscription-stack');

// Reference existing SNS topic for WhatsApp inbound messages
const whatsappSnsTopic = Topic.fromTopicArn(
  snsStack,
  'WhatsAppInboundTopic',
  'arn:aws:sns:us-east-1:809904170947:base-wecare-digital'
);

// Subscribe the inbound-whatsapp-handler Lambda to the SNS topic
whatsappSnsTopic.addSubscription(
  new LambdaSubscription(backend.inboundWhatsappHandler.resources.lambda)
);

export default backend;
