import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const loadingToast = toast.loading('Logging in...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      toast.dismiss(loadingToast);
      login(data.username);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container glass-panel">
        <h1 className="section-title">Welcome Back</h1>
        <p className="section-subtitle">Log in to your GuildGuide account</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            <button type="submit" className="btn btn-primary login-btn">Log In</button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="register-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
