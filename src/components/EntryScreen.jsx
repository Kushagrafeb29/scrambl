import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Map as MapIcon, ShoppingBag, Settings as SettingsIcon, LogIn, BookOpen, Flame, Check,
  Timer, Trophy, Award, BarChart3, Coins, ChevronRight, UserRound,
} from 'lucide-react';
import AdBanner from './AdBanner';
import { WEB_ADS_ENABLED } from '../utils/buildTarget';
import { countryForLevel, TOTAL_LEVELS, COUNTRIES, flagOf } from '../utils/countries';
import { Capacitor } from '@capacitor/core';
import './EntryScreen.css';

const isNative = Capacitor.isNativePlatform();

const tap = { whileTap: { scale: 0.96 } };

const EntryScreen = ({ currentUser, onAuthClick, levelIndex }) => {
  const navigate = useNavigate();

  // Read once on mount; these only change on other screens
  const [{ isDailyDone, dailyStreak, coins }] = useState(() => ({
    isDailyDone: localStorage.getItem('scrambl_last_daily') === new Date().toDateString(),
    dailyStreak: parseInt(localStorage.getItem('scrambl_daily_streak') || '0', 10),
    coins: parseInt(localStorage.getItem('scrambl_coins') || '0', 10),
  }));

  const country = useMemo(() => countryForLevel(levelIndex), [levelIndex]);
  const countryNo = COUNTRIES.indexOf(country) + 1;
  const inCountry = Math.max(0, levelIndex - country.startLevel);
  const countryPct = Math.round((inCountry / country.count) * 100);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : null;

  return (
    <div className="home">
      {/* Top bar */}
      <header className="home-top">
        <div className="brand">
          <img src="/word_scrambl_logo.png" alt="" className="brand-mark" />
          <div>
            <p className="brand-greeting">{greeting}{name ? `, ${name}` : ''}</p>
            <p className="brand-name">Word Scrambl</p>
          </div>
        </div>
        <div className="top-actions">
          <button className="coin-chip" onClick={() => navigate('/shop')} aria-label={`${coins} coins`}>
            <Coins size={15} /> {coins}
          </button>
          <button className="round-btn" onClick={() => navigate('/settings')} aria-label="Settings">
            <SettingsIcon size={19} />
          </button>
        </div>
      </header>

      {/* Journey hero */}
      <motion.section
        className="journey"
        style={country.bg ? { '--journey-bg': `url(${country.bg})` } : undefined}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      >
        <div className="journey-shade" />
        <div className="journey-content">
          <span className="journey-kicker">Destination {countryNo} of {COUNTRIES.length}</span>
          <h1 className="journey-country"><span aria-hidden="true">{flagOf(country)}</span> {country.name}</h1>
          <p className="journey-level">Level {levelIndex + 1} <span>of {TOTAL_LEVELS}</span></p>
          <div className="journey-progress" aria-label={`${countryPct}% of ${country.name} complete`}>
            <div style={{ width: `${countryPct}%` }} />
          </div>
          <p className="journey-progress-label">{inCountry} / {country.count} puzzles in {country.name}</p>
          <motion.button className="journey-play" onClick={() => navigate('/play')} {...tap}>
            <Play size={22} fill="currentColor" /> {levelIndex === 0 ? 'Start Journey' : 'Continue'}
          </motion.button>
        </div>
      </motion.section>

      {/* Daily + Time Attack */}
      <div className="mode-row">
        <motion.button
          className={`mode-card daily ${isDailyDone ? 'is-done' : ''}`}
          onClick={() => { if (!isDailyDone) navigate('/daily'); }}
          disabled={isDailyDone} {...tap}
        >
          <span className="mode-icon">{isDailyDone ? <Check size={22} /> : <Flame size={22} />}</span>
          <span className="mode-title">Daily Puzzle</span>
          <span className="mode-sub">
            {isDailyDone ? 'Solved! Back tomorrow' : dailyStreak > 0 ? `${dailyStreak}-day streak 🔥` : 'New puzzle every day'}
          </span>
        </motion.button>

        <motion.button className="mode-card time" onClick={() => navigate('/time-attack')} {...tap}>
          <span className="mode-icon"><Timer size={22} /></span>
          <span className="mode-title">Time Attack</span>
          <span className="mode-sub">60 seconds. Go!</span>
        </motion.button>
      </div>

      {/* Quick links */}
      <nav className="quick-grid" aria-label="More">
        {[
          { to: '/countries', label: 'World Map', icon: MapIcon },
          { to: '/leaderboard', label: 'Rankings', icon: Trophy },
          { to: '/achievements', label: 'Awards', icon: Award },
          { to: '/stats', label: 'Stats', icon: BarChart3 },
        ].map(({ to, label, icon: Icon }) => (
          <motion.button key={to} className="quick-item" onClick={() => navigate(to)} {...tap}>
            <span className="quick-icon"><Icon size={22} /></span>
            <span>{label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="list-card">
        <button className="list-row" onClick={() => navigate('/shop')}>
          <ShoppingBag size={19} /> <span>{isNative ? 'Shop' : 'Support the game'}</span> <ChevronRight size={18} />
        </button>
        {currentUser ? (
          <button className="list-row" onClick={() => navigate('/settings')}>
            <UserRound size={19} /> <span className="truncate">Signed in as {name}</span> <ChevronRight size={18} />
          </button>
        ) : (
          <button className="list-row" onClick={onAuthClick}>
            <LogIn size={19} /> <span>Sign in to save progress & rank</span> <ChevronRight size={18} />
          </button>
        )}
        {!isNative && (
          <button className="list-row" onClick={() => navigate('/blog')}>
            <BookOpen size={19} /> <span>Word game blog</span> <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Website-only: ad + SEO copy (never in the app) */}
      {WEB_ADS_ENABLED && !isNative && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdBanner dataKey="c90b056c6945a4492aae324b88380368" width={300} height={250} />
        </div>
      )}

      {!isNative && (
        <section className="seo-content">
          <h2>About Word Scrambl: the free daily word puzzle</h2>
          <p>
            Word Scrambl is a free word jumble game that tests your vocabulary. Play {TOTAL_LEVELS.toLocaleString()} handcrafted
            anagram puzzles across {COUNTRIES.length} countries in the campaign. Unscramble each word, collect the circled letters,
            and use them to solve the final riddle for each destination.
          </p>
          <h2>Why play word games daily?</h2>
          <p>
            Daily anagrams help keep your mind sharp and your spelling strong. Relax with the Daily Puzzle, race the clock in
            60-second Time Attack, and visit our <button className="link-btn" onClick={() => navigate('/blog')}>word game blog</button> for
            strategies and tips.
          </p>
        </section>
      )}

      <p className="home-footer">© {new Date().getFullYear()} GoodDude Studios</p>
    </div>
  );
};

export default EntryScreen;
