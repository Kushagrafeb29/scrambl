import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Trophy, Flame, Timer, Coins, BookOpen, Target, BarChart3, Clock } from 'lucide-react';
import { getPlayerStats } from '../utils/playerStats';
import { campaignData } from '../campaignData';
import './PlayerStats.css';

const StatCard = ({ icon: Icon, iconColor, label, value, subValue, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
    <div className="stat-card-icon" style={{ color: iconColor }}>
      <Icon size={22} />
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
    {subValue && <div className="stat-card-sub">{subValue}</div>}
  </div>
);

const PlayerStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getPlayerStats(campaignData.length));
    // Reset body background when entering stats page
    document.body.style.backgroundImage = 'none';
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.background = '';
    };
  }, []);

  if (!stats) return null;

  return (
    <div className="stats-page">
      <Helmet>
        <title>Player Stats | Word Scrambl</title>
        <meta name="description" content="View your Scrambl player statistics, progress, and session data." />
      </Helmet>

      <div className="stats-inner">
        <div className="stats-header">
          <button className="btn-icon" onClick={() => navigate('/')}>
            <ChevronLeft size={24} />
          </button>
          <span className="stats-header-title">Your Stats</span>
          <div style={{ width: 42 }} />
        </div>

        {/* Campaign Progress */}
        <div className="stats-progress">
          <div className="stats-progress-header">
            <Target size={20} color="#34d399" />
            <span>Campaign Progress</span>
            <span className="stats-progress-pct">{stats.campaignProgress}%</span>
          </div>
          <div className="stats-progress-bar-bg">
            <div 
              className="stats-progress-bar-fill"
              style={{ width: `${stats.campaignProgress}%` }}
            />
          </div>
          <div className="stats-progress-detail">
            Level {stats.levelsCompleted} of {campaignData.length}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="stats-grid">
          <StatCard icon={Trophy} iconColor="#fbbf24" label="Levels Cleared" value={stats.levelsCompleted} delay={0} />
          <StatCard icon={BookOpen} iconColor="#60a5fa" label="Words Solved" value={stats.totalWords} delay={0.05} />
          <StatCard icon={Flame} iconColor="#f87171" label="Daily Streak" value={stats.dailyStreak} subValue={`Best: ${stats.bestStreak}`} delay={0.1} />
          <StatCard icon={Timer} iconColor="#c084fc" label="Time Attack Best" value={stats.timeAttackBest} subValue={`${stats.timeAttackGames} games`} delay={0.15} />
          <StatCard icon={Coins} iconColor="#fbbf24" label="Total Coins" value={stats.totalCoins} delay={0.2} />
          <StatCard icon={BarChart3} iconColor="#34d399" label="Definitions Read" value={stats.defsRead} delay={0.25} />
        </div>

        {/* Session Info */}
        <div className="stats-session">
          <h3>
            <Clock size={18} color="#60a5fa" />
            This Session
          </h3>
          <div className="stats-session-row">
            <span>Levels completed</span>
            <strong>{stats.sessionLevels}</strong>
          </div>
          <div className="stats-session-row">
            <span>Time played</span>
            <strong>{stats.sessionTime}</strong>
          </div>
          <div className="stats-session-row">
            <span>Total sessions</span>
            <strong>{stats.sessions}</strong>
          </div>
          <div className="stats-session-row">
            <span>Total time played</span>
            <strong>{stats.totalTimePlayed}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
