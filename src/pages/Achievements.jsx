import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Award } from 'lucide-react';
import { getAllAchievements } from '../utils/achievements';
import './Achievements.css';
import '../App.css';

const Achievements = () => {
  const navigate = useNavigate();
  const achievements = getAllAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const overallProgress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="app-container">
      <Helmet>
        <title>Achievements | Word Scrambl</title>
        <meta name="description" content="View your unlocked achievements and track your progress in Scrambl!" />
      </Helmet>

      <div style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 100, paddingTop: '15px', paddingBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>Achievements</h1>
        <div className="ach-counter">{unlockedCount}/{totalCount}</div>
      </div>

      <div className="ach-progress-section glass-panel animate-fade">
        <div className="ach-progress-header">
          <Award size={24} color="#fbbf24" />
          <span>Overall Progress</span>
        </div>
        <div className="ach-progress-bar-bg">
          <div 
            className="ach-progress-bar-fill" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="ach-progress-label">{overallProgress}% Complete</div>
      </div>

      <div className="ach-grid">
        {achievements.map((ach, i) => (
          <div 
            key={ach.id}
            className={`ach-card glass-panel animate-fade ${ach.unlocked ? 'unlocked' : 'locked'}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="ach-card-icon">{ach.unlocked ? ach.icon : '🔒'}</div>
            <div className="ach-card-info">
              <div className="ach-card-name">{ach.name}</div>
              <div className="ach-card-desc">{ach.description}</div>
              {!ach.unlocked && (
                <div className="ach-card-progress-bar">
                  <div 
                    className="ach-card-progress-fill" 
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              )}
            </div>
            {ach.unlocked && <div className="ach-card-check">✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
