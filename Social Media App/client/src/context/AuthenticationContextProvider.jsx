import React, { createContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthenticationContext = createContext();

const AuthenticationContextProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 1. New state to store login error messages
  const [loginError, setLoginError] = useState('');

  const profilePic = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80';

  const inputs = { username: username, email: email, password: password, profilePic: profilePic };

  const navigate = useNavigate();

  const login = async () => {
    // Clear any previous error before attempting
    setLoginError('');

    try {
      const loginInputs = { email: email, password: password };
      
      const res = await axios.post('https://socialx-backend-g765.onrender.com/login', loginInputs);
      
      console.log("Login success:", res);
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('profilePic', res.data.user.profilePic);
      localStorage.setItem('posts', res.data.user.posts);
      localStorage.setItem('followers', res.data.user.followers);
      localStorage.setItem('following', res.data.user.following);
      
      navigate('/');
    } catch (err) {
      console.log("Login error:", err);
      // 2. Catch backend message (e.g. "User does not exist" or "Invalid credentials")
      if (err.response && err.response.data && err.response.data.msg) {
        setLoginError(err.response.data.msg);
      } else if (err.response && err.response.data && err.response.data.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Something went wrong. Please check your credentials.');
      }
    }
  };

  const register = async () => {
    try {
      const res = await axios.post('https://socialx-backend-g765.onrender.com/register', inputs);
      
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('profilePic', res.data.user.profilePic);
      localStorage.setItem('posts', res.data.user.posts);
      localStorage.setItem('followers', res.data.user.followers);
      localStorage.setItem('following', res.data.user.following);  
      
      navigate('/');
    } catch (err) {
      console.log("Register error:", err);
    }
  };

  const logout = async () => {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorage.removeItem(key);
      }
    }
    navigate('/landing');
  };

  return (
    <AuthenticationContext.Provider 
      value={{
        login, 
        register, 
        logout, 
        username, 
        setUsername, 
        email, 
        setEmail, 
        password, 
        setPassword,
        loginError,     // 3. Exported for Login.jsx to display
        setLoginError   // 4. Exported to allow manual resets if needed
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationContextProvider;