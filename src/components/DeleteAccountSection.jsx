import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// In-app account deletion (required by Google Play for apps that allow sign-up).
const DeleteAccountSection = () => {
  const { currentUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const isEmailUser = currentUser.providerData.some(p => p.providerId === 'password');

  const handleDelete = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteAccount(needsPassword ? password : undefined);
      alert('Your account and online scores have been deleted.');
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        if (isEmailUser) {
          setNeedsPassword(true);
          setError('For security, please enter your password to confirm.');
        } else {
          setError('Please sign out, sign in again, then delete your account.');
        }
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password.');
      } else {
        setError('Could not delete your account. Email kush@wordscrambl.com and we will delete it for you.');
      }
    }
    setBusy(false);
  };

  const dangerBox = {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px'
  };

  if (!open) {
    return (
      <button
        className="btn"
        onClick={() => setOpen(true)}
        style={{ ...dangerBox, padding: undefined, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444' }}
      >
        <UserX size={18} /> Delete Account
      </button>
    );
  }

  return (
    <div style={dangerBox}>
      <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
        ⚠️ This permanently deletes your account ({currentUser.email}) and your leaderboard scores. This cannot be undone.
      </p>
      {needsPassword && (
        <div className="auth-input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        </div>
      )}
      {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={() => { setOpen(false); setError(''); setNeedsPassword(false); setPassword(''); }} style={{ flex: 1 }} disabled={busy}>
          Cancel
        </button>
        <button
          className="btn"
          onClick={handleDelete}
          disabled={busy || (needsPassword && !password)}
          style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}
        >
          {busy ? 'Deleting…' : 'Delete Forever'}
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountSection;
