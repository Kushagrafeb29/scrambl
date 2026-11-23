import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft } from 'lucide-react';
import DeleteAccountSection from '../components/DeleteAccountSection';
import { useAuth } from '../context/AuthContext';
import '../App.css';

// Public account-deletion page (the "web link" Google Play requires in the Data safety form).
const DeleteAccount = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="app-container">
      <Helmet>
        <title>Delete Your Account | SCRAMBL</title>
        <meta name="description" content="How to delete your Word Scrambl account and associated data." />
      </Helmet>
      <div className="header-nav">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', lineHeight: '1.6' }}>
        <h1 className="title" style={{ fontSize: '1.8rem' }}>Delete Your Word Scrambl Account</h1>
        <p>Word Scrambl (by GoodDude Studios) lets you delete your account and its data at any time.</p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Option 1: In the app or on this website</h2>
        <ol>
          <li>Sign in to Word Scrambl.</li>
          <li>Open <strong>Settings</strong>.</li>
          <li>Tap <strong>Delete Account</strong>, then <strong>Delete Forever</strong>.</li>
        </ol>

        {currentUser && (
          <div style={{ margin: '16px 0' }}>
            <DeleteAccountSection />
          </div>
        )}

        <h2 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Option 2: By email</h2>
        <p>
          Email <a href="mailto:kush@wordscrambl.com?subject=Delete%20my%20Word%20Scrambl%20account">kush@wordscrambl.com</a> from
          the address you signed up with, with the subject "Delete my account". We will delete it within 30 days.
        </p>

        <h2 style={{ fontSize: '1.2rem', marginTop: '20px' }}>What gets deleted</h2>
        <ul>
          <li>Your sign-in account (email address and login).</li>
          <li>Your profile: display name, campaign progress and Time Attack high score, including your leaderboard entries.</li>
        </ul>
        <p>
          Bug reports you chose to send may be kept for up to 90 days to fix issues. Game progress saved only on your device
          stays until you clear it with <strong>Settings → Reset All Progress</strong> or uninstall the app.
        </p>
      </div>
    </div>
  );
};

export default DeleteAccount;
