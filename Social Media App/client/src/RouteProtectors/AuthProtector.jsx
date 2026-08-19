import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || localStorage.getItem('_id');

  if (!token || !userId) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default AuthProtector;