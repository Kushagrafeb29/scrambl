import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// Note: lucide's "Map" icon is imported as MapIcon so it can't shadow the global Map constructor
// (that shadowing is what made this page render blank).
import { ChevronLeft, Lock, Play, Check, Map as MapIcon } from 'lucide-react';
import { COUNTRIES, TOTAL_LEVELS, SHOW_FLAGS } from '../utils/countries';
import './CountryNav.css';

const CountryNav = () => {
  const navigate = useNavigate();
  const [currentLevel] = useState(() => {
    const saved = parseInt(localStorage.getItem('scrambl_level') || '0', 10);
    return Number.isFinite(saved) ? saved : 0;
  });
  const currentRef = useRef(null);

  const unlockedCount = useMemo(
    () => COUNTRIES.filter((c) => currentLevel >= c.startLevel).length,
    [currentLevel]
  );

  useEffect(() => {
    // Bring the player's current destination into view
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);

  const play = (country) => {
    // Replaying an earlier country starts at its first level; the current one resumes where you are
    const target = currentLevel >= country.startLevel && currentLevel < country.startLevel + country.count
      ? currentLevel
      : country.startLevel;
    localStorage.setItem('scrambl_level', String(target));
    navigate('/play');
  };

  const overall = Math.min(100, Math.round((currentLevel / TOTAL_LEVELS) * 100));

  return (
    <div className="map-page">
      <Helmet><title>World Map | Word Scrambl</title></Helmet>

      <header className="map-topbar">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Back to home">
          <ChevronLeft size={22} />
        </button>
        <h1>World Map</h1>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <section className="map-hero">
        <MapIcon size={28} />
        <div>
          <p className="map-hero-title">{unlockedCount} of {COUNTRIES.length} destinations unlocked</p>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${overall}%` }} /></div>
          <p className="map-hero-sub">Level {Math.min(currentLevel + 1, TOTAL_LEVELS)} of {TOTAL_LEVELS} · {overall}% of the world explored</p>
        </div>
      </section>

      <ol className="country-list">
        {COUNTRIES.map((c, i) => {
          const done = currentLevel >= c.startLevel + c.count;
          const current = currentLevel >= c.startLevel && !done;
          const locked = currentLevel < c.startLevel;
          const solved = done ? c.count : current ? currentLevel - c.startLevel : 0;
          const pct = Math.round((solved / c.count) * 100);

          return (
            <li
              key={c.id}
              ref={current ? currentRef : null}
              className={`country-card ${locked ? 'is-locked' : ''} ${current ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
              style={c.bg ? { '--card-bg': `url(${c.bg})` } : undefined}
            >
              <button className="country-hit" disabled={locked} onClick={() => play(c)}
                aria-label={locked ? `${c.name} is locked` : `Play ${c.name}`}>
                <span className="country-index">{String(i + 1).padStart(2, '0')}</span>
                {SHOW_FLAGS && <span className="country-flag" aria-hidden="true">{c.flag}</span>}
                <span className="country-body">
                  <span className="country-name">{c.name}</span>
                  <span className="country-meta">{c.region} · Levels {c.startLevel + 1}–{c.startLevel + c.count}</span>
                  {!locked && (
                    <span className="progress-track small"><span className="progress-fill" style={{ width: `${pct}%` }} /></span>
                  )}
                </span>
                <span className="country-action">
                  {locked ? <Lock size={18} /> : done ? <Check size={20} /> : <><Play size={14} fill="currentColor" /> {solved > 0 ? 'Resume' : 'Start'}</>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default CountryNav;
