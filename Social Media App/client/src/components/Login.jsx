import React, { useContext, useState } from 'react';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';

const Login = ({ setIsLoginBox }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthenticationContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form className="authForm" onSubmit={handleLogin}>
      <h2>Login</h2>

      <div className="form-floating authFormInputs">
        <input
          type="email"
          className="form-control"
          id="floatingEmail"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingEmail">Email address</label>
      </div>

      <div className="form-floating authFormInputs">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>

      <button type="submit" className="btn btn-primary">
        Sign in
      </button>

      <p>
        Not registered? <span onClick={() => setIsLoginBox(false)}>Register</span>
      </p>
    </form>
  );
};

export default Login;