#!/usr/bin/env node

const API_BASE = 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';

async function sendTestText() {
  try {
    const payload = {
      contactId: '1d5697a0-8e4d-412f-aa8b-1d96dada431c',
      content: 'Test text message from WECARE.DIGITAL - Checking if API is working',
      phoneNumberId: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
    };
    
    console.log('📤 Sending test text message...');
    console.log(`Contact ID: ${payload.contactId}`);
    console.log(`Phone: 447447840003`);
    console.log('');
    
    const response = await fetch(`${API_BASE}/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS');
      console.log(`Message ID: ${result.messageId}`);
      console.log(`WhatsApp Message ID: ${result.whatsappMessageId}`);
      console.log(`Status: ${result.status}`);
    } else {
      console.log('❌ FAILED');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendTestText();
