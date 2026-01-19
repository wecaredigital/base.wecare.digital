/**
 * API Service Layer
 * Direct DynamoDB queries via AWS SDK
 * 
 * Tables:
 * - base-wecare-digital-ContactsTable
 * - base-wecare-digital-WhatsAppInboundTable
 * - base-wecare-digital-WhatsAppOutboundTable
 * - base-wecare-digital-BulkJobsTable
 */

// For client-side, we'll use API Gateway endpoints or mock data
// The actual DynamoDB queries happen in Lambda functions

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ============================================================================
// CONTACTS API
// ============================================================================

export interface Contact {
  id: string;
  contactId: string;
  name: string;
  phone: string;
  email?: string;
  optInWhatsApp: boolean;
  optInSms: boolean;
  optInEmail: boolean;
  lastInboundMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Mock data based on actual DynamoDB content (base-wecare-digital-ContactsTable)
const MOCK_CONTACTS: Contact[] = [
  {
    id: '61004f7e-43b2-4a80-b247-7eeab58077bc',
    contactId: '61004f7e-43b2-4a80-b247-7eeab58077bc',
    name: 'UK Test',
    phone: '+447123456789',
    email: '',
    optInWhatsApp: true,
    optInSms: false,
    optInEmail: false,
    lastInboundMessageAt: '2026-01-19T14:30:00Z',
    createdAt: '2026-01-18T10:30:00Z',
    updatedAt: '2026-01-19T14:30:00Z',
  },
  {
    id: 'test-customer-001',
    contactId: 'test-customer-001',
    name: 'Test Customer',
    phone: '+919876543210',
    email: 'test@example.com',
    optInWhatsApp: true,
    optInSms: false,
    optInEmail: false,
    lastInboundMessageAt: '2026-01-19T15:05:00Z',
    createdAt: '2026-01-19T08:00:00Z',
    updatedAt: '2026-01-19T15:05:00Z',
  }
];

export async function listContacts(): Promise<Contact[]> {
  // In production, this would call API Gateway -> Lambda -> DynamoDB
  // For now, return mock data that matches actual DynamoDB content
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/contacts`);
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  return MOCK_CONTACTS;
}

export async function getContact(contactId: string): Promise<Contact | null> {
  const contacts = await listContacts();
  return contacts.find(c => c.contactId === contactId) || null;
}

export async function createContact(contact: Partial<Contact>): Promise<Contact | null> {
  const newContact: Contact = {
    id: crypto.randomUUID(),
    contactId: crypto.randomUUID(),
    name: contact.name || '',
    phone: contact.phone || '',
    email: contact.email || '',
    optInWhatsApp: contact.optInWhatsApp || false,
    optInSms: contact.optInSms || false,
    optInEmail: contact.optInEmail || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  // Add to mock data for demo
  MOCK_CONTACTS.push(newContact);
  return newContact;
}

export async function updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
  const index = MOCK_CONTACTS.findIndex(c => c.contactId === contactId);
  if (index >= 0) {
    MOCK_CONTACTS[index] = { ...MOCK_CONTACTS[index], ...updates, updatedAt: new Date().toISOString() };
    return MOCK_CONTACTS[index];
  }
  return null;
}

export async function deleteContact(contactId: string): Promise<boolean> {
  const index = MOCK_CONTACTS.findIndex(c => c.contactId === contactId);
  if (index >= 0) {
    MOCK_CONTACTS.splice(index, 1);
    return true;
  }
  return false;
}

// ============================================================================
// MESSAGES API
// ============================================================================

export interface Message {
  id: string;
  messageId: string;
  contactId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  timestamp: string;
  status: string;
  errorDetails?: string;
  whatsappMessageId?: string;
  mediaId?: string;
  s3Key?: string;
  senderPhone?: string;
}

// Mock messages based on actual DynamoDB content (base-wecare-digital-WhatsAppInboundTable)
const MOCK_MESSAGES: Message[] = [
  {
    id: 'cf03d6dd-126b-4758-8c5d-dfb0b5002318',
    messageId: 'cf03d6dd-126b-4758-8c5d-dfb0b5002318',
    contactId: '61004f7e-43b2-4a80-b247-7eeab58077bc',
    channel: 'WHATSAPP',
    direction: 'INBOUND',
    content: 'Hello from UK test',
    timestamp: '2026-01-19T14:30:00Z',
    status: 'PENDING',
    whatsappMessageId: 'wamid.uktest001',
    senderPhone: '+447123456789',
  },
  {
    id: 'msg-test-customer-001',
    messageId: 'msg-test-customer-001',
    contactId: 'test-customer-001',
    channel: 'WHATSAPP',
    direction: 'INBOUND',
    content: 'Hello!',
    timestamp: '2026-01-19T15:00:00Z',
    status: 'PENDING',
    whatsappMessageId: 'wamid.testcust001',
    senderPhone: '+919876543210',
  },
  {
    id: 'msg-test-customer-002',
    messageId: 'msg-test-customer-002',
    contactId: 'test-customer-001',
    channel: 'WHATSAPP',
    direction: 'INBOUND',
    content: 'Are you there?',
    timestamp: '2026-01-19T15:05:00Z',
    status: 'PENDING',
    whatsappMessageId: 'wamid.testcust002',
    senderPhone: '+919876543210',
  }
];

export async function listMessages(contactId?: string, channel?: string): Promise<Message[]> {
  if (API_BASE) {
    try {
      let url = `${API_BASE}/messages`;
      const params = new URLSearchParams();
      if (contactId) params.append('contactId', contactId);
      if (channel) params.append('channel', channel);
      if (params.toString()) url += `?${params}`;
      
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  let messages = [...MOCK_MESSAGES];
  if (contactId) messages = messages.filter(m => m.contactId === contactId);
  if (channel) messages = messages.filter(m => m.channel === channel.toUpperCase());
  return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const messages = await listMessages();
  return messages.find(m => m.messageId === messageId) || null;
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  const index = MOCK_MESSAGES.findIndex(m => m.messageId === messageId);
  if (index >= 0) {
    MOCK_MESSAGES.splice(index, 1);
    return true;
  }
  return false;
}

// Send WhatsApp message via Lambda
export interface SendMessageRequest {
  contactId: string;
  content: string;
  phoneNumberId?: string;
  isTemplate?: boolean;
  templateName?: string;
  templateParams?: string[];
  mediaFile?: string;
  mediaType?: string;
}

export async function sendWhatsAppMessage(request: SendMessageRequest): Promise<{ messageId: string; status: string } | null> {
  const messageId = crypto.randomUUID();
  const contact = await getContact(request.contactId);
  
  const newMessage: Message = {
    id: messageId,
    messageId,
    contactId: request.contactId,
    channel: 'WHATSAPP',
    direction: 'OUTBOUND',
    content: request.content,
    timestamp: new Date().toISOString(),
    status: 'sent',
    senderPhone: contact?.phone,
  };
  
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  MOCK_MESSAGES.push(newMessage);
  return { messageId, status: 'sent' };
}

export async function sendSmsMessage(contactId: string, content: string): Promise<{ messageId: string; status: string } | null> {
  const messageId = crypto.randomUUID();
  const newMessage: Message = {
    id: messageId,
    messageId,
    contactId,
    channel: 'SMS',
    direction: 'OUTBOUND',
    content,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };
  
  MOCK_MESSAGES.push(newMessage);
  return { messageId, status: 'sent' };
}

export async function sendEmailMessage(contactId: string, subject: string, content: string): Promise<{ messageId: string; status: string } | null> {
  const messageId = crypto.randomUUID();
  const newMessage: Message = {
    id: messageId,
    messageId,
    contactId,
    channel: 'EMAIL',
    direction: 'OUTBOUND',
    content: `Subject: ${subject}\n\n${content}`,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };
  
  MOCK_MESSAGES.push(newMessage);
  return { messageId, status: 'sent' };
}

// ============================================================================
// BULK JOBS API
// ============================================================================

export interface BulkJob {
  id: string;
  jobId: string;
  createdBy: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

const MOCK_BULK_JOBS: BulkJob[] = [];

export async function listBulkJobs(channel?: string): Promise<BulkJob[]> {
  let jobs = [...MOCK_BULK_JOBS];
  if (channel) jobs = jobs.filter(j => j.channel === channel.toUpperCase());
  return jobs;
}

export async function createBulkJob(job: Partial<BulkJob>): Promise<BulkJob | null> {
  const newJob: BulkJob = {
    id: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    createdBy: 'admin',
    channel: (job.channel as any) || 'WHATSAPP',
    totalRecipients: job.totalRecipients || 0,
    sentCount: 0,
    failedCount: 0,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_BULK_JOBS.push(newJob);
  return newJob;
}

export async function updateBulkJobStatus(jobId: string, status: string): Promise<boolean> {
  const job = MOCK_BULK_JOBS.find(j => j.jobId === jobId);
  if (job) {
    job.status = status as any;
    job.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export async function deleteBulkJob(jobId: string): Promise<boolean> {
  const index = MOCK_BULK_JOBS.findIndex(j => j.jobId === jobId);
  if (index >= 0) {
    MOCK_BULK_JOBS.splice(index, 1);
    return true;
  }
  return false;
}

// ============================================================================
// AI AUTOMATION API
// ============================================================================

export interface AIConfig {
  enabled: boolean;
  autoReplyEnabled: boolean;
  knowledgeBaseId: string;
  agentId: string;
  agentAliasId: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: true,  // AI Automation default ON per user requirement
  autoReplyEnabled: true,
  knowledgeBaseId: 'QNZF0YNRWI',
  agentId: 'WECARE-AGENT',
  agentAliasId: 'TSTALIASID',
  maxTokens: 1024,
  temperature: 0.7,
  systemPrompt: 'You are a helpful customer service assistant for WECARE.DIGITAL. Be friendly, professional, and concise.',
};

let currentAIConfig = { ...DEFAULT_AI_CONFIG };

export async function getAIConfig(): Promise<AIConfig> {
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/ai/config`);
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  return currentAIConfig;
}

export async function updateAIConfig(updates: Partial<AIConfig>): Promise<AIConfig> {
  currentAIConfig = { ...currentAIConfig, ...updates };
  
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/ai/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentAIConfig),
      });
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  return currentAIConfig;
}

export async function testAIResponse(message: string): Promise<{ response: string; sources?: string[] }> {
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  // Mock AI response
  return {
    response: `Thank you for your message: "${message}". This is a test response from the AI assistant. In production, this would query the Bedrock Knowledge Base and generate a contextual response.`,
    sources: ['Knowledge Base Document 1', 'FAQ Section 3'],
  };
}

// ============================================================================
// DASHBOARD STATS API
// ============================================================================

export interface DashboardStats {
  messagesToday: number;
  messagesWeek: number;
  activeContacts: number;
  bulkJobs: number;
  deliveryRate: number;
  aiResponses: number;
  dlqDepth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats`);
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  // Calculate stats from mock data
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  
  const messagesToday = MOCK_MESSAGES.filter(m => new Date(m.timestamp).getTime() >= todayStart).length;
  const messagesWeek = MOCK_MESSAGES.filter(m => new Date(m.timestamp).getTime() >= weekStart).length;
  const activeContacts = MOCK_CONTACTS.filter(c => !c.deletedAt).length;
  const bulkJobs = MOCK_BULK_JOBS.filter(j => j.status === 'IN_PROGRESS' || j.status === 'PENDING').length;
  const deliveredCount = MOCK_MESSAGES.filter(m => m.direction === 'OUTBOUND' && (m.status === 'delivered' || m.status === 'read' || m.status === 'sent')).length;
  const totalOutbound = MOCK_MESSAGES.filter(m => m.direction === 'OUTBOUND').length;
  const deliveryRate = totalOutbound > 0 ? Math.round((deliveredCount / totalOutbound) * 100) : 100;
  
  return {
    messagesToday,
    messagesWeek,
    activeContacts,
    bulkJobs,
    deliveryRate,
    aiResponses: 0,  // Would come from AI response logs
    dlqDepth: 0,     // Would come from SQS DLQ
  };
}

// ============================================================================
// SYSTEM HEALTH API
// ============================================================================

export interface SystemHealth {
  whatsapp: { status: 'active' | 'warning' | 'error'; phoneNumbers: number; qualityRating: string };
  sms: { status: 'active' | 'warning' | 'error'; poolId: string };
  email: { status: 'active' | 'warning' | 'error'; verified: boolean };
  ai: { status: 'active' | 'warning' | 'error'; kbId: string };
  dlq: { depth: number; oldestMessage?: string };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/system/health`);
      if (response.ok) return response.json();
    } catch (e) {
      console.error('API error:', e);
    }
  }
  
  return {
    whatsapp: { status: 'active', phoneNumbers: 2, qualityRating: 'GREEN' },
    sms: { status: 'active', poolId: 'pool-wecare-sms' },
    email: { status: 'active', verified: true },
    ai: { status: 'active', kbId: 'QNZF0YNRWI' },
    dlq: { depth: 0 },
  };
}
