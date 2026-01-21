#!/usr/bin/env node

/**
 * Test script to send media via WhatsApp API
 * Usage: node send-test-media.js
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod';

async function sendTestMedia() {
  try {
    // Read test image
    const imagePath = path.join(__dirname, 'test-response-image.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    
    console.log('📸 Test Media Sending');
    console.log('====================');
    console.log(`Image file: ${imagePath}`);
    console.log(`File size: ${imageBuffer.length} bytes`);
    console.log(`Base64 length: ${base64.length} characters`);
    console.log('');
    
    // Prepare payload
    const payload = {
      contactId: '1d5697a0-8e4d-412f-aa8b-1d96dada431c',
      content: 'Test media response from WECARE.DIGITAL - This is a test image',
      phoneNumberId: 'phone-number-id-baa217c3f11b4ffd956f6f3afb44ce54',
      mediaFile: base64,
      mediaType: 'image/jpeg'
    };
    
    console.log('📤 Sending to WhatsApp API...');
    console.log(`Contact ID: ${payload.contactId}`);
    console.log(`Phone: +919876543210`);
    console.log(`Phone Number ID: ${payload.phoneNumberId}`);
    console.log(`Media Type: ${payload.mediaType}`);
    console.log('');
    
    // Send request
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
      console.log('');
      console.log('📱 Media should appear in WhatsApp within seconds');
    } else {
      console.log('❌ FAILED');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${result.error}`);
      console.log(`Details: ${JSON.stringify(result, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendTestMedia();
