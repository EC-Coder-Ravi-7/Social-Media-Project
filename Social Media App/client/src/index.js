import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { GeneralContextProvider } from './context/GeneralContextProvider';
import AuthenticationContextProvider from './context/AuthenticationContextProvider';
import { SocketContextProvider } from './context/SocketContextProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthenticationContextProvider>
        {/* Uncomment SocketContextProvider agar aap socket functionality use karna chahte ho */}
        {/* <SocketContextProvider> */}
          <GeneralContextProvider>
            <App />
          </GeneralContextProvider>
        {/* </SocketContextProvider> */}
      </AuthenticationContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Report web vitals can be logged or sent to an analytics endpoint.
reportWebVitals();
