import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./styles/tailwind.css";
import "./styles/index.css";
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext'
import { FilterProvider } from './contexts/FilterContext';
import { NotificationProvider } from './contexts/NotificationContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>  
        <NotificationProvider>
      <FilterProvider>
        <App />
      </FilterProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)