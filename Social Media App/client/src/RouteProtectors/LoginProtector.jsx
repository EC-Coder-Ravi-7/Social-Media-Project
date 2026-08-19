import React from 'react';
import { Navigate } from 'react-router-dom';

const LoginProtector = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || localStorage.getItem('_id');

  if (token && userId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default LoginProtector;