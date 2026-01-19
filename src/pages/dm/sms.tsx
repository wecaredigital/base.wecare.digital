/**
 * SMS DM Page
 * WECARE.DIGITAL Admin Platform
 */

import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const SmsDM: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/messaging?channel=sms');
  }, [router]);
  
  return null;
};

export default SmsDM;
