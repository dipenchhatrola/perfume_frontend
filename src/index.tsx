import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'green',
            secondary: 'white',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: 'red',
            secondary: 'white',
          },
        },
      }}
    />
  </React.StrictMode>
);