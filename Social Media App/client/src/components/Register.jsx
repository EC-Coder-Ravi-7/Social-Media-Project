import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setIsLoginBox }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      alert('Registration successful! Please login.');
      setIsLoginBox(true);
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <form className="authForm" onSubmit={handleRegister}>
      <h2>Register</h2>

      <div className="form-floating authFormInputs">
        <input
          type="text"
          className="form-control"
          id="floatingFullName"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <label htmlFor="floatingFullName">Full name</label>
      </div>

      <div className="form-floating authFormInputs">
        <input
          type="text"
          className="form-control"
          id="floatingRegUser"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="floatingRegUser">Username</label>
      </div>

      <div className="form-floating authFormInputs">
        <input
          type="email"
          className="form-control"
          id="floatingRegEmail"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingRegEmail">Email address</label>
      </div>

      <div className="form-floating authFormInputs">
        <input
          type="password"
          className="form-control"
          id="floatingRegPassword"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingRegPassword">Password</label>
      </div>

      <button type="submit" className="btn btn-primary">
        Sign up
      </button>

      <p>
        Already have an account? <span onClick={() => setIsLoginBox(true)}>Login</span>
      </p>
    </form>
  );
};

export default Register;