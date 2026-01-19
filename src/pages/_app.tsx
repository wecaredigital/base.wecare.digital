/**
 * WECARE.DIGITAL Admin Platform
 * Next.js App Component
 */

import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './Pages.css';
import '../components/Layout.css';

import outputs from '../../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Component {...pageProps} signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}
