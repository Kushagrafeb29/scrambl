import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      console.error(err);
      setError('Failed to reset password: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade">
        <Link to="/login" className="back-link"><ArrowLeft size={18} /> Back to Login</Link>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">We'll send you a link to get back into your account</p>
        
        {error && <div className="auth-error"><AlertCircle size={18} /> {error}</div>}
        {message && <div className="auth-success"><CheckCircle2 size={18} /> {message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button disabled={loading} type="submit" className="auth-btn-primary">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
