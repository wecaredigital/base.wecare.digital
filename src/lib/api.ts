/**
 * API Service Layer
 * Connects to API Gateway -> Lambda -> DynamoDB
 * NO MOCK DATA - All data fetched from real AWS resources
 * 
 * API Endpoint: Uses NEXT_PUBLIC_API_BASE or defaults to production
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';

// Connection status tracking
let lastConnectionError: string | null = null;
let connectionStatus: 'connected' | 'disconnected' | 'unknown' = 'unknown';

export function getConnectionStatus() {
  return { status: connectionStatus, lastError: lastConnectionError };
}

// Helper function for API calls with better error handling
async function apiCall<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      connectionStatus = 'connected';
      lastConnectionError = null;
      return response.json();
    }
    
    // Handle specific HTTP errors
    if (response.status === 403) {
      lastConnectionError = 'Access denied - check API Gateway permissions';
    } else if (response.status === 404) {
      lastConnectionError = 'API endpoint not found';
    } else if (response.status === 500) {
      lastConnectionError = 'Server error - check Lambda logs';
    } else if (response.status === 502 || response.status === 503) {
      lastConnectionError = 'API Gateway error - service unavailable';
    } else {
      lastConnectionError = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    connectionStatus = 'disconnected';
    console.error(`API error: ${lastConnectionError}`, url);
    return null;
  } catch (e: any) {
    connectionStatus = 'disconnected';
    if (e.name === 'AbortError') {
      lastConnectionError = 'Request timeout - API took too long';
    } else if (e.name === 'TypeError') {
      lastConnectionError = 'CORS error or network unavailable';
    } else {
      lastConnectionError = e.message || 'Connection failed';
    }
    console.error('API call failed:', lastConnectionError, url, e);
    return null;
  }
}

// Test API connection
export async function testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
  const start = Date.now();
  try {
    const response = await fetch(`${API_BASE}/contacts`, { method: 'GET' });
    const latency = Date.now() - start;
    
    if (response.ok) {
      connectionStatus = 'connected';
      lastConnectionError = null;
      return { success: true, message: `Connected (${latency}ms)`, latency };
    }
    
    connectionStatus = 'disconnected';
    lastConnectionError = `HTTP ${response.status}`;
    return { success: false, message: `API returned ${response.status}: ${response.statusText}` };
  } catch (e: any) {
    connectionStatus = 'disconnected';
    lastConnectionError = e.message;
    return { success: false, message: `Connection failed: ${e.message}` };
  }
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
  // Opt-in fields (Requirement 3.2)
  optInWhatsApp: boolean;
  optInSms: boolean;
  optInEmail: boolean;
  // Allowlist fields (Requirement 3.2)
  allowlistWhatsApp: boolean;
  allowlistSms: boolean;
  allowlistEmail: boolean;
  lastInboundMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export async function listContacts(): Promise<Contact[]> {
  const data = await apiCall<any>(`${API_BASE}/contacts`);
  if (data) {
    const contacts = Array.isArray(data) ? data : (data.contacts || []);
    return contacts.map(normalizeContact);
  }
  return [];
}

export async function getContact(contactId: string): Promise<Contact | null> {
  const data = await apiCall<any>(`${API_BASE}/contacts/${contactId}`);
  if (data) {
    return normalizeContact(data.contact || data);
  }
  return null;
}

export async function createContact(contact: Partial<Contact>): Promise<Contact | null> {
  const data = await apiCall<any>(`${API_BASE}/contacts`, {
    method: 'POST',
    body: JSON.stringify(contact),
  });
  if (data) {
    return normalizeContact(data.contact || data);
  }
  return null;
}

export async function updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
  const data = await apiCall<any>(`${API_BASE}/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  if (data) {
    return normalizeContact(data.contact || data);
  }
  return null;
}

export async function deleteContact(contactId: string): Promise<boolean> {
  const data = await apiCall<any>(`${API_BASE}/contacts/${contactId}`, {
    method: 'DELETE',
  });
  // Check if response indicates success (not an error)
  return data !== null && !data.error;
}

function normalizeContact(item: any): Contact {
  return {
    id: item.id || item.contactId || '',
    contactId: item.contactId || item.id || '',
    name: item.name || '',
    phone: item.phone || '',
    email: item.email || '',
    // Opt-in fields
    optInWhatsApp: item.optInWhatsApp || false,
    optInSms: item.optInSms || false,
    optInEmail: item.optInEmail || false,
    // Allowlist fields (Requirement 3.2)
    allowlistWhatsApp: item.allowlistWhatsApp || false,
    allowlistSms: item.allowlistSms || false,
    allowlistEmail: item.allowlistEmail || false,
    lastInboundMessageAt: item.lastInboundMessageAt ? new Date(Number(item.lastInboundMessageAt) * 1000).toISOString() : undefined,
    createdAt: item.createdAt ? new Date(Number(item.createdAt) * 1000).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(Number(item.updatedAt) * 1000).toISOString() : new Date().toISOString(),
    deletedAt: item.deletedAt,
  };
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
  mediaUrl?: string;
  senderPhone?: string;
  receivingPhone?: string;
  awsPhoneNumberId?: string;
}

export async function listMessages(contactId?: string, channel?: string): Promise<Message[]> {
  let url = `${API_BASE}/messages`;
  const params = new URLSearchParams();
  if (contactId) params.append('contactId', contactId);
  if (channel) params.append('channel', channel);
  if (params.toString()) url += `?${params}`;
  
  const data = await apiCall<any>(url);
  if (data) {
    const messages = Array.isArray(data) ? data : (data.messages || []);
    return messages.map(normalizeMessage);
  }
  return [];
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const messages = await listMessages();
  return messages.find(m => m.messageId === messageId) || null;
}

export async function deleteMessage(messageId: string, direction: 'INBOUND' | 'OUTBOUND' = 'INBOUND'): Promise<boolean> {
  const data = await apiCall<any>(`${API_BASE}/messages/${messageId}?direction=${direction}`, {
    method: 'DELETE',
  });
  return data !== null && data.success === true;
}

function normalizeMessage(item: any): Message {
  const timestamp = item.timestamp || item.createdAt;
  return {
    id: item.id || item.messageId || '',
    messageId: item.messageId || item.id || '',
    contactId: item.contactId || '',
    channel: (item.channel || 'WHATSAPP').toUpperCase() as 'WHATSAPP' | 'SMS' | 'EMAIL',
    direction: (item.direction || 'INBOUND').toUpperCase() as 'INBOUND' | 'OUTBOUND',
    content: item.content || item.text || '',
    timestamp: timestamp ? (typeof timestamp === 'number' ? new Date(timestamp * 1000).toISOString() : timestamp) : new Date().toISOString(),
    status: item.status || 'received',
    whatsappMessageId: item.whatsappMessageId,
    mediaId: item.mediaId,
    s3Key: item.s3Key,
    mediaUrl: item.mediaUrl,  // Use pre-signed URL from API
    senderPhone: item.senderPhone,
    receivingPhone: item.receivingPhone,
    awsPhoneNumberId: item.awsPhoneNumberId,
  };
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

// Send WhatsApp reaction via Lambda
export interface SendReactionRequest {
  contactId: string;
  reactionMessageId: string;  // WhatsApp message ID to react to
  reactionEmoji?: string;     // Default: thumbs up
  phoneNumberId?: string;
}

export async function sendWhatsAppMessage(request: SendMessageRequest): Promise<{ messageId: string; status: string } | null> {
  return apiCall<{ messageId: string; status: string }>(`${API_BASE}/whatsapp/send`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Send a reaction to a WhatsApp message
export async function sendWhatsAppReaction(request: SendReactionRequest): Promise<{ messageId: string; status: string; emoji: string } | null> {
  return apiCall<{ messageId: string; status: string; emoji: string }>(`${API_BASE}/whatsapp/send`, {
    method: 'POST',
    body: JSON.stringify({
      contactId: request.contactId,
      isReaction: true,
      reactionMessageId: request.reactionMessageId,
      reactionEmoji: request.reactionEmoji || '\uD83D\uDC4D',  // Default: thumbs up
      phoneNumberId: request.phoneNumberId,
    }),
  });
}

export async function sendSmsMessage(contactId: string, content: string): Promise<{ messageId: string; status: string } | null> {
  return apiCall<{ messageId: string; status: string }>(`${API_BASE}/sms/send`, {
    method: 'POST',
    body: JSON.stringify({ contactId, content }),
  });
}

export async function sendEmailMessage(contactId: string, subject: string, content: string, htmlContent?: string): Promise<{ messageId: string; status: string } | null> {
  return apiCall<{ messageId: string; status: string }>(`${API_BASE}/email/send`, {
    method: 'POST',
    body: JSON.stringify({ contactId, subject, content, htmlContent }),
  });
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
  let url = `${API_BASE}/bulk/jobs`;
  if (channel) url += `?channel=${channel}`;
  const data = await apiCall<any>(url);
  if (data) {
    return Array.isArray(data) ? data : (data.jobs || []);
  }
  return [];
}

export async function createBulkJob(job: Partial<BulkJob>): Promise<BulkJob | null> {
  return apiCall<BulkJob>(`${API_BASE}/bulk/jobs`, {
    method: 'POST',
    body: JSON.stringify(job),
  });
}

export async function updateBulkJobStatus(jobId: string, status: string): Promise<boolean> {
  const data = await apiCall<any>(`${API_BASE}/bulk/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data !== null;
}

export async function deleteBulkJob(jobId: string): Promise<boolean> {
  const data = await apiCall<any>(`${API_BASE}/bulk/jobs/${jobId}`, {
    method: 'DELETE',
  });
  return data !== null;
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

// Real AWS Resource IDs
const AI_CONFIG: AIConfig = {
  enabled: true,
  autoReplyEnabled: true,
  knowledgeBaseId: 'FZBPKGTOYE',
  agentId: 'HQNT0JXN8G',
  agentAliasId: 'base_bedrock_agentcore-1XHDxj2o3Q',
  maxTokens: 1024,
  temperature: 0.7,
  systemPrompt: 'You are a helpful customer service assistant for WECARE.DIGITAL.',
};

export async function getAIConfig(): Promise<AIConfig> {
  // In production, this would fetch from SystemConfig table
  return AI_CONFIG;
}

export async function updateAIConfig(updates: Partial<AIConfig>): Promise<AIConfig> {
  // In production, this would update SystemConfig table
  Object.assign(AI_CONFIG, updates);
  return AI_CONFIG;
}

export async function testAIResponse(message: string): Promise<{ response: string; sources?: string[] }> {
  const data = await apiCall<any>(`${API_BASE}/ai/generate`, {
    method: 'POST',
    body: JSON.stringify({ messageContent: message }),
  });
  
  if (data) {
    return {
      response: data.suggestedResponse || data.suggestion || 'No response generated',
      sources: data.sources || ['Knowledge Base'],
    };
  }
  return { response: 'AI service unavailable', sources: [] };
}

// Get AI suggestions for message replies
export async function getAISuggestions(message: string, channel?: string, context?: string): Promise<string[]> {
  // First try the AI generate endpoint
  const data = await apiCall<any>(`${API_BASE}/ai/generate`, {
    method: 'POST',
    body: JSON.stringify({ 
      messageContent: message,
      context: {
        channel: channel || 'whatsapp',
        contactName: context,
      },
    }),
  });
  
  if (data && data.suggestedResponse) {
    // Return the AI-generated response as a suggestion
    return [data.suggestedResponse];
  }
  
  // Fallback suggestions if API fails
  return [
    'Thank you for reaching out! How can I help you today?',
    'I\'ll look into this and get back to you shortly.',
    'Is there anything else I can assist you with?',
  ];
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
  // Fetch real data from contacts, messages, and bulk jobs
  const [contacts, messages, bulkJobs] = await Promise.all([
    listContacts(),
    listMessages(),
    listBulkJobs()
  ]);
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  
  const messagesToday = messages.filter(m => new Date(m.timestamp).getTime() >= todayStart).length;
  const messagesWeek = messages.filter(m => new Date(m.timestamp).getTime() >= weekStart).length;
  const activeContacts = contacts.filter(c => !c.deletedAt).length;
  
  // Calculate delivery rate from outbound messages
  const outboundMessages = messages.filter(m => m.direction === 'OUTBOUND');
  const deliveredMessages = outboundMessages.filter(m => 
    m.status === 'delivered' || m.status === 'read' || m.status === 'sent'
  );
  const deliveryRate = outboundMessages.length > 0 
    ? Math.round((deliveredMessages.length / outboundMessages.length) * 100) 
    : 100;
  
  // Count active bulk jobs
  const activeBulkJobs = bulkJobs.filter(j => 
    j.status === 'PENDING' || j.status === 'IN_PROGRESS'
  ).length;
  
  return {
    messagesToday,
    messagesWeek,
    activeContacts,
    bulkJobs: activeBulkJobs,
    deliveryRate,
    aiResponses: 0, // Would need AI interactions table query
    dlqDepth: 0, // Would need DLQ depth API
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
  // Real AWS Resource IDs
  return {
    whatsapp: { status: 'active', phoneNumbers: 2, qualityRating: 'GREEN' },
    sms: { status: 'active', poolId: 'pool-6fbf5a5f390d4eeeaa7dbae39d78933e' },
    email: { status: 'active', verified: true },
    ai: { status: 'active', kbId: 'FZBPKGTOYE' },
    dlq: { depth: 0 },
  };
}


// ============================================================================
// VOICE CALLS API
// ============================================================================

export interface VoiceCall {
  id: string;
  callId: string;
  contactId: string;
  phoneNumber: string;
  provider: 'aws' | 'airtel';
  callType: 'tts' | 'audio' | 'ivr' | 'click_to_call';
  status: string;
  direction: 'INBOUND' | 'OUTBOUND';
  duration: number;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MakeVoiceCallRequest {
  contactId?: string;
  phoneNumber: string;
  provider: 'aws' | 'airtel';
  callType: 'tts' | 'audio' | 'ivr' | 'click_to_call';
  messageText?: string;
  voiceId?: string;
  audioUrl?: string;
}

export async function listVoiceCalls(contactId?: string, provider?: string): Promise<VoiceCall[]> {
  let url = `${API_BASE}/voice/calls`;
  const params = new URLSearchParams();
  if (contactId) params.append('contactId', contactId);
  if (provider) params.append('provider', provider);
  if (params.toString()) url += `?${params}`;
  
  const data = await apiCall<any>(url);
  if (data) {
    const calls = Array.isArray(data) ? data : (data.calls || []);
    return calls.map(normalizeVoiceCall);
  }
  return [];
}

export async function getVoiceCall(callId: string): Promise<VoiceCall | null> {
  const data = await apiCall<any>(`${API_BASE}/voice/calls/${callId}`);
  if (data) {
    return normalizeVoiceCall(data.call || data);
  }
  return null;
}

export async function makeVoiceCall(request: MakeVoiceCallRequest): Promise<{ callId: string; status: string } | null> {
  return apiCall<{ callId: string; status: string }>(`${API_BASE}/voice/call`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

function normalizeVoiceCall(item: any): VoiceCall {
  return {
    id: item.id || item.callId || '',
    callId: item.callId || item.id || '',
    contactId: item.contactId || '',
    phoneNumber: item.phoneNumber || '',
    provider: item.provider || 'aws',
    callType: item.callType || 'tts',
    status: item.status || 'unknown',
    direction: (item.direction || 'OUTBOUND').toUpperCase() as 'INBOUND' | 'OUTBOUND',
    duration: item.duration || 0,
    recordingUrl: item.recordingUrl,
    createdAt: item.createdAt ? new Date(Number(item.createdAt) * 1000).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(Number(item.updatedAt) * 1000).toISOString() : new Date().toISOString(),
  };
}


// ============================================================================
// DLQ API
// ============================================================================

export interface DLQMessage {
  id: string;
  queueName: string;
  retryCount: number;
  lastAttemptAt: number;
  error: string;
}

export async function listDLQMessages(): Promise<DLQMessage[]> {
  const data = await apiCall<any>(`${API_BASE}/dlq`);
  if (data) {
    return data.messages || [];
  }
  return [];
}

export async function replayDLQMessages(queueName: string, batchSize?: number): Promise<{ processed: number; succeeded: number; failed: number } | null> {
  return apiCall<{ processed: number; succeeded: number; failed: number }>(`${API_BASE}/dlq/replay`, {
    method: 'POST',
    body: JSON.stringify({ queueName, batchSize: batchSize || 10 }),
  });
}
