import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

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

export default backend;
