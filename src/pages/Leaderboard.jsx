import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, ChevronLeft, Timer, Map as MapIcon, RefreshCw, WifiOff } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

// Firestore's getDocs can wait indefinitely when offline or when the database is unavailable,
// so every leaderboard request is capped.
const withTimeout = (promise, ms = 8000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
]);

const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [topTimeAttack, setTopTimeAttack] = useState([]);
  const [topCampaign, setTopCampaign] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeAttack');
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch Top Time Attack Scores
        const timeAttackQuery = query(collection(db, 'users'), orderBy('timeAttackHighScore', 'desc'), limit(50));
        const timeAttackSnapshot = await withTimeout(getDocs(timeAttackQuery));
        const timeAttackData = [];
        timeAttackSnapshot.forEach((doc) => {
          if (doc.data().timeAttackHighScore > 0) {
            timeAttackData.push({ id: doc.id, ...doc.data() });
          }
        });
        setTopTimeAttack(timeAttackData);

        // Fetch Top Campaign Levels
        const campaignQuery = query(collection(db, 'users'), orderBy('campaignLevel', 'desc'), limit(50));
        const campaignSnapshot = await withTimeout(getDocs(campaignQuery));
        const campaignData = [];
        campaignSnapshot.forEach((doc) => {
          if (doc.data().campaignLevel > 0) {
            campaignData.push({ id: doc.id, ...doc.data() });
          }
        });
        setTopCampaign(campaignData);
      } catch (err) {
        console.error("Error fetching leaderboards:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [reloadKey]);

  const tabs = [
    { id: 'timeAttack', label: 'Time Attack', icon: Timer },
    { id: 'campaign', label: 'Campaign', icon: MapIcon },
  ];

  const getData = () => {
    switch (activeTab) {
      case 'timeAttack': return topTimeAttack;
      case 'campaign': return topCampaign;
      default: return [];
    }
  };

  const getValue = (user) => {
    switch (activeTab) {
      case 'timeAttack': return user.timeAttackHighScore;
      case 'campaign': return `Level ${user.campaignLevel}`;
      default: return '';
    }
  };

  const getUserRank = () => {
    if (!currentUser) return null;
    const data = getData();
    const idx = data.findIndex(u => u.id === currentUser.uid);
    return idx >= 0 ? idx + 1 : null;
  };

  const userRank = getUserRank();

  return (
    <div className="app-container">
      <Helmet>
        <title>Global Leaderboard | Word Scrambl</title>
      </Helmet>

      <div style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 100, paddingTop: '15px', paddingBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>Leaderboard</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Your Rank Card */}
      {currentUser && userRank && (
        <div className="glass-panel animate-fade" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={20} color="#fbbf24" />
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Your Rank</span>
          </div>
          <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
            #{userRank}
          </div>
        </div>
      )}

      <div className="glass-panel animate-fade" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  flex: 1, padding: '14px', background: 'transparent', border: 'none', 
                  color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading global rankings…
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <WifiOff size={32} />
              <strong style={{ color: 'var(--text-primary)' }}>Rankings are unavailable right now</strong>
              <span style={{ fontSize: '0.85rem' }}>Check your connection and try again. Your own scores are safe on this device.</span>
              <button className="btn btn-primary" onClick={() => setReloadKey(k => k + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getData().map((user, idx) => {
                const isMe = currentUser && user.id === currentUser.uid;
                return (
                  <div key={user.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '12px 14px', 
                    background: isMe ? 'rgba(26, 93, 26, 0.06)' : (idx < 3 ? 'rgba(251, 191, 36, 0.04)' : 'transparent'),
                    borderRadius: '12px',
                    border: isMe ? '2px solid var(--primary-color)' : '1px solid transparent',
                    borderLeft: idx === 0 ? '4px solid #fbbf24' : idx === 1 ? '4px solid #94a3b8' : idx === 2 ? '4px solid #b45309' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        width: '32px', textAlign: 'center', fontWeight: 'bold', 
                        fontSize: idx < 3 ? '1.2rem' : '0.9rem',
                        color: idx < 3 ? '#fbbf24' : 'var(--text-secondary)' 
                      }}>
                        {idx < 3 ? MEDAL_EMOJIS[idx] : `#${idx + 1}`}
                      </span>
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {user.displayName || 'Player'}
                        </span>
                        {isMe && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '700', marginLeft: '6px' }}>YOU</span>}
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                      {getValue(user)}
                    </div>
                  </div>
                );
              })}
              
              {getData().length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No scores yet. Sign in and play {activeTab === 'timeAttack' ? 'Time Attack' : 'the Campaign'} to claim the #1 spot!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
