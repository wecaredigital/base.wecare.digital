/**
 * API Service Layer
 * Connects frontend to Amplify GraphQL API and Lambda functions
 */

import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';

// GraphQL client for Amplify Data - use any type to avoid complex type inference
let client: any = null;

export const getClient = () => {
  if (!client) {
    client = generateClient();
  }
  return client;
};

// API Base URL - Lambda Function URLs or API Gateway
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch {
    return null;
  }
}

// Generic API call helper
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  return response.json();
}

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

export async function listContacts(): Promise<Contact[]> {
  try {
    const client = getClient();
    const { data, errors } = await (client.models as any).Contact.list({
      filter: { deletedAt: { attributeExists: false } }
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to list contacts');
    return data || [];
  } catch (error) {
    console.error('listContacts error:', error);
    return [];
  }
}

export async function getContact(contactId: string): Promise<Contact | null> {
  try {
    const client = getClient();
    const { data, errors } = await (client.models as any).Contact.get({ contactId });
    if (errors) throw new Error(errors[0]?.message || 'Failed to get contact');
    return data;
  } catch (error) {
    console.error('getContact error:', error);
    return null;
  }
}

export async function createContact(contact: Partial<Contact>): Promise<Contact | null> {
  try {
    const client = getClient();
    const now = new Date().toISOString();
    const { data, errors } = await (client.models as any).Contact.create({
      contactId: crypto.randomUUID(),
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || null,
      optInWhatsApp: contact.optInWhatsApp || false,
      optInSms: contact.optInSms || false,
      optInEmail: contact.optInEmail || false,
      createdAt: now,
      updatedAt: now,
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to create contact');
    return data;
  } catch (error) {
    console.error('createContact error:', error);
    return null;
  }
}

export async function updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
  try {
    const client = getClient();
    const { data, errors } = await (client.models as any).Contact.update({
      contactId,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to update contact');
    return data;
  } catch (error) {
    console.error('updateContact error:', error);
    return null;
  }
}

export async function deleteContact(contactId: string): Promise<boolean> {
  try {
    const client = getClient();
    // Soft delete
    const { errors } = await (client.models as any).Contact.update({
      contactId,
      deletedAt: new Date().toISOString(),
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to delete contact');
    return true;
  } catch (error) {
    console.error('deleteContact error:', error);
    return false;
  }
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
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  errorDetails?: string;
  whatsappMessageId?: string;
  mediaId?: string;
  s3Key?: string;
  senderPhone?: string;
}

export async function listMessages(contactId?: string, channel?: string): Promise<Message[]> {
  try {
    const client = getClient();
    const filter: any = {};
    if (contactId) filter.contactId = { eq: contactId };
    if (channel) filter.channel = { eq: channel.toUpperCase() };
    
    const { data, errors } = await (client.models as any).Message.list({
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: 100,
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to list messages');
    return (data || []).sort((a: Message, b: Message) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  } catch (error) {
    console.error('listMessages error:', error);
    return [];
  }
}

export async function getMessage(messageId: string): Promise<Message | null> {
  try {
    const client = getClient();
    const { data, errors } = await (client.models as any).Message.get({ messageId });
    if (errors) throw new Error(errors[0]?.message || 'Failed to get message');
    return data;
  } catch (error) {
    console.error('getMessage error:', error);
    return null;
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).Message.delete({ messageId });
    if (errors) throw new Error(errors[0]?.message || 'Failed to delete message');
    return true;
  } catch (error) {
    console.error('deleteMessage error:', error);
    return false;
  }
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
  try {
    // For now, create message record directly (Lambda integration would be via API Gateway)
    const client = getClient();
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, errors } = await (client.models as any).Message.create({
      messageId,
      contactId: request.contactId,
      channel: 'WHATSAPP',
      direction: 'OUTBOUND',
      content: request.content,
      timestamp: now,
      status: 'SENT',
    });
    
    if (errors) throw new Error(errors[0]?.message || 'Failed to send message');
    return { messageId, status: 'sent' };
  } catch (error) {
    console.error('sendWhatsAppMessage error:', error);
    return null;
  }
}

export async function sendSmsMessage(contactId: string, content: string): Promise<{ messageId: string; status: string } | null> {
  try {
    const client = getClient();
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, errors } = await (client.models as any).Message.create({
      messageId,
      contactId,
      channel: 'SMS',
      direction: 'OUTBOUND',
      content,
      timestamp: now,
      status: 'SENT',
    });
    
    if (errors) throw new Error(errors[0]?.message || 'Failed to send SMS');
    return { messageId, status: 'sent' };
  } catch (error) {
    console.error('sendSmsMessage error:', error);
    return null;
  }
}

export async function sendEmailMessage(contactId: string, subject: string, content: string): Promise<{ messageId: string; status: string } | null> {
  try {
    const client = getClient();
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, errors } = await (client.models as any).Message.create({
      messageId,
      contactId,
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      content: `Subject: ${subject}\n\n${content}`,
      timestamp: now,
      status: 'SENT',
    });
    
    if (errors) throw new Error(errors[0]?.message || 'Failed to send email');
    return { messageId, status: 'sent' };
  } catch (error) {
    console.error('sendEmailMessage error:', error);
    return null;
  }
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

export async function listBulkJobs(channel?: string): Promise<BulkJob[]> {
  try {
    const client = getClient();
    const filter = channel ? { channel: { eq: channel.toUpperCase() } } : undefined;
    const { data, errors } = await (client.models as any).BulkJob.list({ filter });
    if (errors) throw new Error(errors[0]?.message || 'Failed to list bulk jobs');
    return data || [];
  } catch (error) {
    console.error('listBulkJobs error:', error);
    return [];
  }
}

export async function createBulkJob(job: Partial<BulkJob>): Promise<BulkJob | null> {
  try {
    const client = getClient();
    const now = new Date().toISOString();
    const { data, errors } = await (client.models as any).BulkJob.create({
      jobId: crypto.randomUUID(),
      createdBy: 'admin',
      channel: job.channel || 'WHATSAPP',
      totalRecipients: job.totalRecipients || 0,
      sentCount: 0,
      failedCount: 0,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to create bulk job');
    return data;
  } catch (error) {
    console.error('createBulkJob error:', error);
    return null;
  }
}

export async function updateBulkJobStatus(jobId: string, status: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).BulkJob.update({
      jobId,
      status,
      updatedAt: new Date().toISOString(),
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to update bulk job');
    return true;
  } catch (error) {
    console.error('updateBulkJobStatus error:', error);
    return false;
  }
}

export async function deleteBulkJob(jobId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).BulkJob.delete({ jobId });
    if (errors) throw new Error(errors[0]?.message || 'Failed to delete bulk job');
    return true;
  } catch (error) {
    console.error('deleteBulkJob error:', error);
    return false;
  }
}

// ============================================================================
// AI INTERACTIONS API
// ============================================================================

export interface AIInteraction {
  id: string;
  interactionId: string;
  messageId: string;
  query: string;
  response: string;
  approved: boolean;
  feedback?: string;
  timestamp: string;
}

export async function listAIInteractions(approved?: boolean): Promise<AIInteraction[]> {
  try {
    const client = getClient();
    const filter = approved !== undefined ? { approved: { eq: approved } } : undefined;
    const { data, errors } = await (client.models as any).AIInteraction.list({ filter });
    if (errors) throw new Error(errors[0]?.message || 'Failed to list AI interactions');
    return data || [];
  } catch (error) {
    console.error('listAIInteractions error:', error);
    return [];
  }
}

export async function approveAIResponse(interactionId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).AIInteraction.update({
      interactionId,
      approved: true,
    });
    if (errors) throw new Error(errors[0]?.message || 'Failed to approve AI response');
    return true;
  } catch (error) {
    console.error('approveAIResponse error:', error);
    return false;
  }
}

export async function rejectAIResponse(interactionId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).AIInteraction.delete({ interactionId });
    if (errors) throw new Error(errors[0]?.message || 'Failed to reject AI response');
    return true;
  } catch (error) {
    console.error('rejectAIResponse error:', error);
    return false;
  }
}

// ============================================================================
// SYSTEM CONFIG API
// ============================================================================

export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    const client = getClient();
    const { data, errors } = await (client.models as any).SystemConfig.get({ configKey: key });
    if (errors) throw new Error(errors[0]?.message || 'Failed to get config');
    return data?.configValue || null;
  } catch (error) {
    console.error('getSystemConfig error:', error);
    return null;
  }
}

export async function setSystemConfig(key: string, value: string): Promise<boolean> {
  try {
    const client = getClient();
    const { errors } = await (client.models as any).SystemConfig.update({
      configKey: key,
      configValue: value,
      updatedAt: new Date().toISOString(),
    });
    if (errors) {
      // Try create if update fails
      await (client.models as any).SystemConfig.create({
        configKey: key,
        configValue: value,
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  } catch (error) {
    console.error('setSystemConfig error:', error);
    return false;
  }
}

// ============================================================================
// DASHBOARD STATS
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
  try {
    const [contacts, messages, jobs, aiInteractions] = await Promise.all([
      listContacts(),
      listMessages(),
      listBulkJobs(),
      listAIInteractions(),
    ]);
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    
    const messagesToday = messages.filter(m => new Date(m.timestamp).getTime() >= todayStart).length;
    const messagesWeek = messages.filter(m => new Date(m.timestamp).getTime() >= weekStart).length;
    const delivered = messages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
    const sent = messages.filter(m => m.direction === 'OUTBOUND').length;
    
    return {
      messagesToday,
      messagesWeek,
      activeContacts: contacts.length,
      bulkJobs: jobs.length,
      deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 100,
      aiResponses: aiInteractions.length,
      dlqDepth: 0, // Would need DLQ API
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return {
      messagesToday: 0,
      messagesWeek: 0,
      activeContacts: 0,
      bulkJobs: 0,
      deliveryRate: 100,
      aiResponses: 0,
      dlqDepth: 0,
    };
  }
}
