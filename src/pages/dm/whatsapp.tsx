/**
 * WhatsApp DM Page
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const WhatsAppDM: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/messaging?channel=whatsapp');
  }, [router]);
  
  return null;
};

export default WhatsAppDM;
