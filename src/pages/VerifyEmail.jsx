import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import './Auth.css';

const VerifyEmail = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail, currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleResend() {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await verifyEmail();
      setMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to resend: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade">
        <div className="verify-icon">
          <Mail size={60} color="#00d2ff" />
        </div>
        <h2 className="auth-title">Verify Your Email</h2>
        <p className="auth-subtitle">
          We've sent a verification link to <strong>{currentUser?.email}</strong>. 
          Please click the link to activate your account.
        </p>
        
        {error && <div className="auth-error"><AlertCircle size={18} /> {error}</div>}
        {message && <div className="auth-success"><CheckCircle2 size={18} /> {message}</div>}
        
        <div className="auth-form">
          <button onClick={() => navigate('/')} className="auth-btn-primary">
            I've Verified My Email
          </button>
          <button disabled={loading} onClick={handleResend} className="auth-btn-google">
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Resend Email
          </button>
        </div>
        
        <div className="auth-links">
          <button onClick={() => navigate('/login')} className="btn-link">Use a different account</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
