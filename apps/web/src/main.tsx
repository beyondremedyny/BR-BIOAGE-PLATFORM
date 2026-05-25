import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!clerkKey) {
  document.getElementById('root')!.innerHTML =
    '<div style="font-family:monospace;padding:2rem;color:#ff6b6b;background:#1e1e2e;min-height:100vh">' +
    '<h2>Missing VITE_CLERK_PUBLISHABLE_KEY</h2>' +
    '<p>Add your Clerk publishable key to the root <code>.env</code> file and restart the dev server.</p>' +
    '</div>';
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkKey ?? ''}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
