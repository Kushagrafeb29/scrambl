import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Map, ShoppingCart, Settings as SettingsIcon, LogIn, User, BookOpen, Flame, Check, Timer, Trophy, Award, BarChart3, Coins } from 'lucide-react';
import AdBanner from './AdBanner';
import { WEB_ADS_ENABLED } from '../utils/buildTarget';
import { Capacitor } from '@capacitor/core';
import './EntryScreen.css';

const EntryScreen = ({ currentUser, onAuthClick, levelIndex, levelData }) => {
  const navigate = useNavigate();
  const [country, setCountry] = useState('Detecting...');
  const [dailyStreak, setDailyStreak] = useState(0);
  const [isDailyDone, setIsDailyDone] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setCountry(data.country_name || 'Global');
      })
      .catch(() => setCountry('Exploration Mode'));
      
    const todayStr = new Date().toDateString();
    const lastDaily = localStorage.getItem('scrambl_last_daily');
    setIsDailyDone(lastDaily === todayStr);
    setDailyStreak(parseInt(localStorage.getItem('scrambl_daily_streak') || '0', 10));
    setCoins(parseInt(localStorage.getItem('scrambl_coins') || '0', 10));
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <motion.div 
          className="home-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img src="/word_scrambl_logo.png" alt="Scrambl Logo" className="home-logo" />
        </motion.div>

        <div className="home-stats">
          <div className="stat-pill">Level {levelIndex + 1}</div>
          <div className="stat-pill">{levelData?.countryName || 'World'}</div>
          <div className="stat-pill coin-pill">
            <Coins size={14} /> {coins}
          </div>
        </div>

        {currentUser && (
          <motion.div 
            className="welcome-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back, <strong>{currentUser.displayName || currentUser.email.split('@')[0]}</strong>! 👋
          </motion.div>
        )}

        <div className="home-grid">
          <div className="home-primary-grid">
            <motion.button 
              className="home-btn primary" 
              onClick={() => navigate('/play')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={32} fill="currentColor" />
              <span>CAMPAIGN</span>
            </motion.button>

            <motion.button 
              className={`home-btn primary daily ${isDailyDone ? 'done' : ''}`}
              onClick={() => { if (!isDailyDone) navigate('/daily'); }}
              whileHover={!isDailyDone ? { scale: 1.05 } : {}}
              whileTap={!isDailyDone ? { scale: 0.95 } : {}}
            >
              {isDailyDone ? <Check size={32} /> : <Flame size={32} />}
              <span>{isDailyDone ? 'DONE' : 'DAILY'}</span>
              {!isDailyDone && dailyStreak > 0 && <span className="streak-badge">{dailyStreak} 🔥</span>}
            </motion.button>
          </div>
          
          <div className="home-secondary-grid">
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/leaderboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy size={28} />
              <span>Leaderboard</span>
            </motion.button>
            
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/time-attack')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Timer size={28} />
              <span>Time Attack</span>
            </motion.button>

            <motion.button 
              className="home-btn secondary accent-gold" 
              onClick={() => navigate('/achievements')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={28} />
              <span>Achievements</span>
            </motion.button>

            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/stats')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 size={28} />
              <span>Stats</span>
            </motion.button>
            
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/countries')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Map size={28} />
              <span>Map</span>
            </motion.button>
            
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/shop')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={28} />
              <span>Shop</span>
            </motion.button>
            
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/settings')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SettingsIcon size={28} />
              <span>Settings</span>
            </motion.button>
            
            <motion.button 
              className="home-btn secondary" 
              onClick={() => navigate('/blog')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen size={28} />
              <span>Blog</span>
            </motion.button>

            {!currentUser ? (
              <motion.button 
                className="home-btn secondary" 
                onClick={onAuthClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={28} />
                <span>Sign In</span>
              </motion.button>
            ) : (
              <div className="home-btn secondary user-profile">
                <User size={28} />
                <span className="truncate">{currentUser.email.split('@')[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Square Adsterra Banner */}
        {WEB_ADS_ENABLED && !Capacitor.isNativePlatform() && (
          <div style={{ marginTop: '40px' }}>
            <AdBanner dataKey="c90b056c6945a4492aae324b88380368" width={300} height={250} />
          </div>
        )}

        <div className="seo-content" style={{ marginTop: '60px', padding: '30px 20px', color: 'rgba(255,255,255,0.5)', textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>About Scrambl: The Premium Word Puzzle Game</h2>
          <p style={{ marginBottom: '15px' }}>
            Welcome to Scrambl, the ultimate free daily word puzzle game designed to test your vocabulary and cognitive skills. Play through over 1,400 handcrafted anagram puzzles across 25 different countries in our massive campaign mode. Every level requires you to unscramble challenging words, collect hidden circled letters, and use them to solve a final trivia-based mystery word.
          </p>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>Why Play Word Games Daily?</h2>
          <p>
            Engaging in daily anagrams and word games like Scrambl has been shown to improve memory retention, enhance spelling skills, and keep your mind sharp. Whether you want to relax with the daily challenge or test your speed in our 60-second Time Attack mode, Scrambl offers the best brain-training experience for fans of crosswords and anagrams. If you get stuck, use our built-in hint system, or visit our <span onClick={() => navigate('/blog')} style={{color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline'}}>Word Game Blog</span> for advanced strategies and daily tips!
          </p>
        </div>

      </div>
    </div>
  );
};

export default EntryScreen;
