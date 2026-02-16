import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./styles/tailwind.css";
import "./styles/index.css";
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext'
import { FilterProvider } from './contexts/FilterContext';
import { NotificationProvider } from './contexts/NotificationContext';

import { SocketProvider } from './contexts/SocketContext';

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>  
          <SocketProvider>
            <NotificationProvider>
              <FilterProvider>
                <App />
              </FilterProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)