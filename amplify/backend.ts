import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Stack } from 'aws-cdk-lib';

// Import Lambda functions
import { authMiddleware } from './functions/auth-middleware/resource';
import { contactsCreate } from './functions/contacts-create/resource';
import { contactsRead } from './functions/contacts-read/resource';
import { contactsUpdate } from './functions/contacts-update/resource';
import { contactsDelete } from './functions/contacts-delete/resource';
import { contactsSearch } from './functions/contacts-search/resource';
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
});

// Create HTTP API for frontend to call Lambda functions
const apiStack = backend.createStack('api-stack');

const httpApi = new apigateway.HttpApi(apiStack, 'WecareDmApi', {
  apiName: 'wecare-dm-api',
  corsPreflight: {
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: [apigateway.CorsHttpMethod.GET, apigateway.CorsHttpMethod.POST, apigateway.CorsHttpMethod.PUT, apigateway.CorsHttpMethod.DELETE, apigateway.CorsHttpMethod.OPTIONS],
    allowOrigins: ['https://base.wecare.digital', 'https://base.dtiq7il2x5c5g.amplifyapp.com', 'http://localhost:3000'],
    maxAge: Stack.of(apiStack).toJsonString({ days: 1 }),
  },
});

// Contacts API routes
const contactsReadIntegration = new integrations.HttpLambdaIntegration('ContactsReadIntegration', backend.contactsRead.resources.lambda);
const contactsCreateIntegration = new integrations.HttpLambdaIntegration('ContactsCreateIntegration', backend.contactsCreate.resources.lambda);
const contactsUpdateIntegration = new integrations.HttpLambdaIntegration('ContactsUpdateIntegration', backend.contactsUpdate.resources.lambda);
const contactsDeleteIntegration = new integrations.HttpLambdaIntegration('ContactsDeleteIntegration', backend.contactsDelete.resources.lambda);
const contactsSearchIntegration = new integrations.HttpLambdaIntegration('ContactsSearchIntegration', backend.contactsSearch.resources.lambda);

httpApi.addRoutes({
  path: '/contacts',
  methods: [apigateway.HttpMethod.GET],
  integration: contactsSearchIntegration,
});

httpApi.addRoutes({
  path: '/contacts',
  methods: [apigateway.HttpMethod.POST],
  integration: contactsCreateIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [apigateway.HttpMethod.GET],
  integration: contactsReadIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [apigateway.HttpMethod.PUT],
  integration: contactsUpdateIntegration,
});

httpApi.addRoutes({
  path: '/contacts/{contactId}',
  methods: [apigateway.HttpMethod.DELETE],
  integration: contactsDeleteIntegration,
});

// WhatsApp API routes
const outboundWhatsappIntegration = new integrations.HttpLambdaIntegration('OutboundWhatsappIntegration', backend.outboundWhatsapp.resources.lambda);

httpApi.addRoutes({
  path: '/whatsapp/send',
  methods: [apigateway.HttpMethod.POST],
  integration: outboundWhatsappIntegration,
});

// SMS API routes
const outboundSmsIntegration = new integrations.HttpLambdaIntegration('OutboundSmsIntegration', backend.outboundSms.resources.lambda);

httpApi.addRoutes({
  path: '/sms/send',
  methods: [apigateway.HttpMethod.POST],
  integration: outboundSmsIntegration,
});

// Email API routes
const outboundEmailIntegration = new integrations.HttpLambdaIntegration('OutboundEmailIntegration', backend.outboundEmail.resources.lambda);

httpApi.addRoutes({
  path: '/email/send',
  methods: [apigateway.HttpMethod.POST],
  integration: outboundEmailIntegration,
});

// Bulk Job API routes
const bulkJobCreateIntegration = new integrations.HttpLambdaIntegration('BulkJobCreateIntegration', backend.bulkJobCreate.resources.lambda);
const bulkJobControlIntegration = new integrations.HttpLambdaIntegration('BulkJobControlIntegration', backend.bulkJobControl.resources.lambda);

httpApi.addRoutes({
  path: '/bulk/jobs',
  methods: [apigateway.HttpMethod.POST],
  integration: bulkJobCreateIntegration,
});

httpApi.addRoutes({
  path: '/bulk/jobs/{jobId}',
  methods: [apigateway.HttpMethod.GET, apigateway.HttpMethod.PUT],
  integration: bulkJobControlIntegration,
});

// AI API routes
const aiQueryKbIntegration = new integrations.HttpLambdaIntegration('AiQueryKbIntegration', backend.aiQueryKb.resources.lambda);
const aiGenerateResponseIntegration = new integrations.HttpLambdaIntegration('AiGenerateResponseIntegration', backend.aiGenerateResponse.resources.lambda);

httpApi.addRoutes({
  path: '/ai/query',
  methods: [apigateway.HttpMethod.POST],
  integration: aiQueryKbIntegration,
});

httpApi.addRoutes({
  path: '/ai/generate',
  methods: [apigateway.HttpMethod.POST],
  integration: aiGenerateResponseIntegration,
});

// Output the API URL
backend.addOutput({
  custom: {
    API: {
      endpoint: httpApi.url,
    },
  },
});

export default backend;
