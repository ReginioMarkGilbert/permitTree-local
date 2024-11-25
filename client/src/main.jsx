import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@/components/ThemeProvider';
import App from './App';
import './index.css';
import client from './apolloClient';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = ReactDOM.createRoot(rootElement);
root.render(
   <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="permittree-theme">
         <ApolloProvider client={client}>
            <BrowserRouter>
               <App />
            </BrowserRouter>
         </ApolloProvider>
      </ThemeProvider>
   </React.StrictMode>
);
