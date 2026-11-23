import React, { useState } from 'react';
import { Bug, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ReportBug.css';

const ReportBug = ({ onClose }) => {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'bugs'), {
        email,
        description,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });
      setStatus('success');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bug-modal-overlay">
      <div className="bug-modal animate-fade">
        <div className="bug-header">
          <Bug className="bug-icon" size={24} />
          <h2>Report a Bug</h2>
        </div>
        
        {status === 'success' ? (
          <div className="bug-success">
            <CheckCircle2 size={48} color="#2ecc71" />
            <p>Thank you! Our engineers are on it. 🛠️</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bug-form">
            <p className="bug-intro">Help us improve SCRAMBL. Let us know what's broken!</p>
            
            <div className="bug-input-group">
              <label>What's the issue?</label>
              <textarea 
                required 
                placeholder="Describe the bug in detail..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bug-input-group">
              <label>Your Email (Optional)</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {status === 'error' && (
              <div className="bug-error">
                <AlertCircle size={18} /> Failed to send. Please try again.
              </div>
            )}

            <div className="bug-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button disabled={status === 'loading'} type="submit" className="btn-submit">
                {status === 'loading' ? 'Sending...' : <><Send size={16} /> SEND REPORT</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportBug;
