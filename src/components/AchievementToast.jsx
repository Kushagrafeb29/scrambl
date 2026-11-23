import React, { useEffect, useState } from 'react';
import './AchievementToast.css';

const AchievementToast = ({ achievement, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDone?.(), 500);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div className={`achievement-toast ${visible ? 'show' : 'hide'}`}>
      <div className="achievement-toast-glow" />
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-label">ACHIEVEMENT UNLOCKED</div>
        <div className="achievement-toast-name">{achievement.name}</div>
        <div className="achievement-toast-desc">{achievement.description}</div>
      </div>
    </div>
  );
};

export default AchievementToast;
