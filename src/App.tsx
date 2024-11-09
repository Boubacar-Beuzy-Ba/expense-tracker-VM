import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
          }}
        >
          <AntApp>
            <ThemeProvider>
              <CurrencyProvider>
                <AuthProvider>
                  <AppRoutes />
                  <Toaster />
                </AuthProvider>
              </CurrencyProvider>
            </ThemeProvider>
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}