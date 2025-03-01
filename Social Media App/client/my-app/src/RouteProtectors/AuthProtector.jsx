import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setAuthenticated(!!token);
  }, []);

  if (authenticated === null) {
    // Optionally render a loader
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/landing" />;
  }

  return children;
};

export default AuthProtector;
