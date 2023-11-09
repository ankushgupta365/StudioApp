import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { SlotStatusContextProvider } from './context/SlotStatusContext';
import {GoogleOAuthProvider} from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom';
import {router} from './App'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
    <SlotStatusContextProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <App />
        </GoogleOAuthProvider>
    </SlotStatusContextProvider>
  </AuthContextProvider>
);


