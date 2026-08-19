import React, { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const navigate = useNavigate();

  const login = async () => {
    setLoginError('');
    try {
      const res = await axios.post('http://localhost:6001/login', {
        email,
        password,
      });

      if (res.data.token) {
        const user = res.data.user;
        
        // Save all required keys
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('_id', user.id);
        localStorage.setItem('username', user.username);
        localStorage.setItem('userName', user.username);
        localStorage.setItem('email', user.email);
        localStorage.setItem('profilePic', user.profilePic || '');

        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        setLoginError(err.response.data.msg);
        alert(err.response.data.msg);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    }
};

  const register = async () => {
    try {
      const res = await axios.post('http://localhost:6001/register', {
        username,
        email,
        password,
        profilePic: '',
        about: 'Hey there! I am using SocialX.',
      });

      if (res.status === 201 || res.status === 200) {
        alert('Registered successfully! Please sign in.');
      }
    } catch (err) {
      console.error('Register error:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        alert(err.response.data.msg);
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