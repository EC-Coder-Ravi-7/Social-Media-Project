import React, { useContext, useState } from 'react';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = ({ setIsLoginBox }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const { login } = useContext(AuthenticationContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const finalIdentifier = (form.elements.identifier?.value || identifier || '').trim();
    const finalPassword = (form.elements.password?.value || password || '').trim();

    if (!finalIdentifier || !finalPassword) {
      alert('Please provide email/username and password');
      return;
    }

    await login({
      email: finalIdentifier,
      username: finalIdentifier,
      password: finalPassword,
    });
  };

  return (
    <>
      <form className="authForm" onSubmit={handleLogin}>
        <h2>Login</h2>

        <div className="form-floating authFormInputs">
          <input
            type="text"
            className="form-control"
            id="floatingIdentifier"
            name="identifier"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <label htmlFor="floatingIdentifier">Username or email</label>
        </div>

        <div className="form-floating authFormInputs passwordInputWrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            id="floatingPassword"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="floatingPassword">Password</label>
          <button
            type="button"
            className="passwordToggleBtn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex="-1"
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>

        <div style={{ textAlign: 'right', margin: '-4px 0 10px 0' }}>
          <span
            onClick={() => setIsForgotOpen(true)}
            style={{ fontSize: '13px', color: 'rgb(0, 108, 197)', cursor: 'pointer', fontWeight: '500' }}
          >
            Forgot password?
          </span>
        </div>

        <button type="submit" className="btn btn-primary loginSubmitBtn">
          Sign in
        </button>

        <p>
          Not registered? <span onClick={() => setIsLoginBox(false)}>Register</span>
        </p>
      </form>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </>
  );
};

export default Login;