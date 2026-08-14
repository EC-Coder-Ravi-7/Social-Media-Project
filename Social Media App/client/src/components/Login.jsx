import React, { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';

const Login = ({ setIsLoginBox }) => {
  // Grab loginError and setLoginError from Context
  const { setEmail, setPassword, login, loginError, setLoginError } = useContext(AuthenticationContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (setLoginError) setLoginError(''); // Reset error before new attempt
    await login();
  };

  return (
    <form className="authForm" onSubmit={handleLogin}>
      <h2>Login</h2>

      {/* --- Error Message Display --- */}
      {loginError && (
        <div 
          className="alert alert-danger py-2 text-center" 
          role="alert" 
          style={{ fontSize: '14px', width: '100%', marginBottom: '15px' }}
        >
          {loginError}
        </div>
      )}

      <div className="form-floating mb-3 authFormInputs">
        <input 
          type="email" 
          className="form-control" 
          id="floatingInput" 
          placeholder="name@example.com" 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <label htmlFor="floatingInput">Email address</label>
      </div>

      <div className="form-floating mb-3 authFormInputs">
        <input 
          type="password" 
          className="form-control" 
          id="floatingPassword" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required
        /> 
        <label htmlFor="floatingPassword">Password</label>
      </div>

      <button type="submit" className="btn btn-primary">Sign in</button>

      <p>Not registered? <span onClick={() => setIsLoginBox(false)} style={{ cursor: 'pointer' }}>Register</span></p>
    </form>
  );
};

export default Login;