import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    const loadingToast = toast.loading('Sending reset link...');
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Reset link sent to ' + email);
      setEmail('');
    }, 1000);
  };
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container glass-panel">
        <h1 className="section-title">Reset Password</h1>
        <p className="section-subtitle">Enter your email and we'll send you a reset link</p>
        
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary reset-btn">Send Reset Link</button>
        </form>
        
        <div className="auth-footer">
          <Link to="/login" className="back-link">← Back to Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
