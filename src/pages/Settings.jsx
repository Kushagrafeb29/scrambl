import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, VolumeX, Music, Settings as SettingsIcon, Trash2, RotateCcw, Info } from 'lucide-react';
import { toggleBGM } from '../utils/audio';
import DeleteAccountSection from '../components/DeleteAccountSection';
import ReportBug from '../components/ReportBug';
import '../App.css';

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('scrambl_sound_enabled') !== 'false');
  const [musicEnabled, setMusicEnabled] = useState(() => localStorage.getItem('scrambl_music_enabled') !== 'false');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('scrambl_sound_enabled', newState.toString());
  };

  const handleToggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    localStorage.setItem('scrambl_music_enabled', newState.toString());
    toggleBGM();
  };

  const handleResetProgress = () => {
    // Reset game progress
    localStorage.setItem('scrambl_level', '0');
    localStorage.removeItem('scrambl_coins');
    localStorage.removeItem('scrambl_daily_streak');
    localStorage.removeItem('scrambl_last_daily');
    localStorage.removeItem('scrambl_best_streak');
    localStorage.removeItem('scrambl_total_words');
    localStorage.removeItem('scrambl_ta_best');
    localStorage.removeItem('scrambl_ta_games');
    localStorage.removeItem('scrambl_defs_read');
    localStorage.removeItem('scrambl_total_time');
    localStorage.removeItem('scrambl_sessions');
    localStorage.removeItem('scrambl_session_levels');
    localStorage.removeItem('scrambl_achievements');
    localStorage.removeItem('scrambl_early_bird');
    setShowResetConfirm(false);
    alert('Progress has been reset. Returning to home.');
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="header-nav">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <SettingsIcon size={64} color="#e94560" />
        <h1 className="title" style={{ marginTop: '10px' }}>SETTINGS</h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {soundEnabled ? <Volume2 size={24} color="var(--primary-color)" /> : <VolumeX size={24} color="#888" />}
            <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Sound Effects</span>
          </div>
          <button 
            className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={handleToggleSound}
          >
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Music size={24} color={musicEnabled ? "var(--primary-color)" : "#888"} />
            <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Background Music</span>
          </div>
          <button 
            className={`btn ${musicEnabled ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={handleToggleMusic}
          >
            {musicEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />
        
        <button className="btn btn-secondary" onClick={() => navigate('/privacy')}>Privacy Policy</button>
        <button className="btn btn-secondary" onClick={() => navigate('/terms')}>Terms of Service</button>
        <button className="btn btn-secondary" onClick={() => setShowBugReport(true)}>Report a Bug</button>
        {showBugReport && <ReportBug onClose={() => setShowBugReport(false)} />}

        <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

        {/* Danger Zone */}
        {!showResetConfirm ? (
          <button 
            className="btn" 
            onClick={() => setShowResetConfirm(true)}
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <RotateCcw size={18} /> Reset All Progress
          </button>
        ) : (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
              ⚠️ This will erase ALL your progress, achievements, and coins. This cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleResetProgress}
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}
              >
                <Trash2 size={16} /> Confirm Reset
              </button>
            </div>
          </div>
        )}

        <DeleteAccountSection />

        {/* App Version */}
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)', 
          fontSize: '0.75rem', 
          marginTop: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          opacity: 0.6
        }}>
          <Info size={12} />
          Word Scrambl v1.0.4 • © GoodDude Studios
        </div>
      </div>
    </div>
  );
};

export default Settings;
