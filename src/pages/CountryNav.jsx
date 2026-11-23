import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Map, Lock, Play } from 'lucide-react';
import { campaignData } from '../campaignData';
import '../App.css';

const CountryNav = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('scrambl_level');
    setCurrentLevel(saved !== null ? parseInt(saved, 10) : 0);
    
    // Set a dedicated background for the map page
    document.body.style.backgroundImage = 'none';
    document.body.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)';
    
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.background = '';
    };
  }, []);

  // Group levels by country
  const countryMap = new Map();
  campaignData.forEach((level) => {
    if (!countryMap.has(level.countryId)) {
      countryMap.set(level.countryId, {
        name: level.countryName,
        startLevel: level.id,
        count: 1
      });
    } else {
      const countryInfo = countryMap.get(level.countryId);
      countryInfo.count += 1;
    }
  });

  const countries = Array.from(countryMap.values());

  const handleSelectCountry = (startLevel, isLocked) => {
    if (isLocked) return;
    localStorage.setItem('scrambl_level', startLevel.toString());
    navigate('/play');
  };

  return (
    <div className="app-container">
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 100, paddingTop: '15px', paddingBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>World Map</h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Map size={64} color="#00ffcc" />
        <h1 className="title" style={{ marginTop: '10px' }}>DESTINATIONS</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Travel the world by solving puzzles.</p>
      </div>

      <div className="countries-grid" style={{ display: 'grid', gap: '15px', padding: '0 20px', maxWidth: '500px', margin: '0 auto' }}>
        {countries.map((country, idx) => {
          const isLocked = currentLevel < country.startLevel;
          const isCurrent = currentLevel >= country.startLevel && currentLevel < (country.startLevel + country.count);
          const isCompleted = currentLevel >= (country.startLevel + country.count);

          return (
            <div
              key={idx}
              className={`glass-panel country-card ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.6 : 1,
                border: isCurrent ? '2px solid #00ffcc' : 'none'
              }}
              onClick={() => handleSelectCountry(country.startLevel, isLocked)}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{country.name}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Levels {country.startLevel + 1} - {country.startLevel + country.count}
                </span>
              </div>
              <div>
                {isLocked ? (
                  <Lock size={24} color="#888" />
                ) : isCompleted ? (
                  <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>DONE</span>
                ) : (
                  <button className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
                    <Play size={16} /> PLAY
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CountryNav;
