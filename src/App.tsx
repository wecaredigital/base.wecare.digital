/**
 * WECARE.DIGITAL Admin Platform
 * 
 * Main application component with routing and layout.
 * Requirements: 12.1, 12.2, 12.7
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Messaging from './pages/Messaging';
import BulkMessaging from './pages/BulkMessaging';
import AIAutomation from './pages/AIAutomation';

import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

const App: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Layout user={user} onSignOut={signOut}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/bulk-messaging" element={<BulkMessaging />} />
              <Route path="/ai-automation" element={<AIAutomation />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
};

export default App;
