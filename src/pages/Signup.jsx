import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin, verifyEmail } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      await verifyEmail();
      navigate('/verify-email');
    } catch (err) {
      console.error(err);
      setError('Failed to create an account: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade">
        <h2 className="auth-title">Join Scrambl</h2>
        <p className="auth-subtitle">Start your journey across 25 countries</p>
        
        {error && <div className="auth-error"><AlertCircle size={18} /> {error}</div>}
        
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
          <div className="auth-input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="auth-input-group">
            <ShieldCheck className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} type="submit" className="auth-btn-primary">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Google popup sign-in is blocked inside Android WebViews; hidden in the app until a native sign-in plugin is added */}
        {!Capacitor.isNativePlatform() && (<>
        <div className="auth-divider"><span>OR</span></div>

        <button 
          onClick={googleLogin} 
          className="auth-btn-google"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign up with Google
        </button>
        </>)}

        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
