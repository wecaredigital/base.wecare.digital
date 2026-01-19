/**
 * Email DM Page (SES)
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EmailDM: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/messaging?channel=email');
  }, [router]);
  
  return null;
};

export default EmailDM;
