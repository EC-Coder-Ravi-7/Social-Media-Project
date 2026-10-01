import React, { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from './GeneralContextProvider';

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const navigate = useNavigate();

  const login = async (credentials) => {
    setLoginError('');
    try {
      // Support login via passed credentials object or state
      const payload = credentials || { email, password };

      const res = await axios.post('http://localhost:6001/login', payload);

      if (res.data.token) {
        const user = res.data.user;

        // Save authenticated user details
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('_id', user.id);
        localStorage.setItem('userName', user.username);
        socket.emit('join-user-room', {
          userId: user.id,
        });
        console.log('🔔 Joining notification room:', user.id);
        // Save the dynamic full name from DB
        localStorage.setItem('fullName', user.fullName || user.username);
        localStorage.setItem('email', user.email);
        localStorage.setItem('profilePic', user.profilePic || '');

        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && (err.response.data.msg || err.response.data.error)) {
        const message = err.response.data.msg || err.response.data.error;
        setLoginError(message);
        alert(message);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    }
  };

  const register = async (regData) => {
    try {
      const payload = regData || {
        username,
        email,
        password,
        profilePic: '',
        about: 'Hey there! I am using SocialX.',
      };

      const res = await axios.post('http://localhost:6001/register', payload);

      if (res.status === 201 || res.status === 200) {
        alert('Registered successfully! Please sign in.');
      }
    } catch (err) {
      console.error('Register error:', err);
      if (err.response && err.response.data && (err.response.data.msg || err.response.data.error)) {
        alert(err.response.data.msg || err.response.data.error);
      } else {
        alert('Server unreachable. Ensure backend is running on port 6001.');
      }
    }
  };

  const logout = async () => {
    localStorage.clear();
    navigate('/landing');
  };

  return (
    <AuthenticationContext.Provider
      value={{
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        login,
        register,
        logout,
        loginError,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationContextProvider;