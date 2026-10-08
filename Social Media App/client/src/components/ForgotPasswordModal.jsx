import React, { useState } from 'react';
import '../styles/ForgotPasswordModal.css';
import { RxCross2 } from 'react-icons/rx';
import { BsEye, BsEyeSlash, BsShieldLock } from 'react-icons/bs';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !newPassword.trim()) {
      alert('Please fill out all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/resetPassword`, {
        identifier: identifier.trim(),
        newPassword: newPassword.trim(),
      });

      alert(res.data.msg || 'Password updated successfully!');
      setIdentifier('');
      setNewPassword('');
      setLoading(false);
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error resetting password');
      setLoading(false);
    }
  };

  return (
    <div className="forgotModalOverlay" onClick={onClose}>
      <div className="forgotModalBox" onClick={(e) => e.stopPropagation()}>
        <div className="forgotModalHeader">
          <BsShieldLock className="forgotLockIcon" />
          <h3>Trouble logging in?</h3>
          <p>Enter your username or email and choose a new password.</p>
          <button type="button" className="forgotModalClose" onClick={onClose}>
            <RxCross2 />
          </button>
        </div>

        <form onSubmit={handleReset} className="forgotForm">
          <div className="form-floating authFormInputs">
            <input
              type="text"
              className="form-control"
              id="resetIdentifier"
              placeholder="Username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <label htmlFor="resetIdentifier">Username or email</label>
          </div>

          <div className="form-floating authFormInputs passwordInputWrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              id="resetPassword"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label htmlFor="resetPassword">New password</label>
            <button
              type="button"
              className="passwordToggleBtn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <BsEyeSlash /> : <BsEye />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary forgotSubmitBtn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;