import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { campaignData } from './campaignData';
import { initGA, logPageView } from './utils/analytics';
import { initCrazyGames } from './utils/crazygames';
import { checkAchievements } from './utils/achievements';
import { startSession, endSession } from './utils/playerStats';

// Components
import IntroAnimation from './components/IntroAnimation';
import EntryScreen from './components/EntryScreen';
import AchievementToast from './components/AchievementToast';
import InstallPrompt from './components/InstallPrompt';
import AdBanner from './components/AdBanner';
import { WEB_ADS_ENABLED } from './utils/buildTarget';
import { Capacitor } from '@capacitor/core';
import Game from './pages/Game';
import TimeAttack from './pages/TimeAttack';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import PlayerStats from './pages/PlayerStats';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Shop from './pages/Shop';
import Settings from './pages/Settings';
import CountryNav from './pages/CountryNav';
import Blog from './pages/Blog';
import DeleteAccount from './pages/DeleteAccount';

function App() {
  const { currentUser, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [levelIndex, setLevelIndex] = useState(() => {
    const saved = localStorage.getItem('scrambl_level');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const levelData = campaignData[levelIndex];
  const navigate = useNavigate();
  const location = useLocation();
  // Adsterra banners only on our own website, never in the app or on CrazyGames/portal builds
  const isWeb = WEB_ADS_ENABLED && !Capacitor.isNativePlatform();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    initGA();
    initCrazyGames();
    startSession();

    // End session tracking on page unload
    const handleUnload = () => endSession();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      endSession();
    };
  }, []);

  useEffect(() => {
    logPageView(location.pathname);
  }, [location]);

  useEffect(() => {
    // Check if intro was already seen this session
    const introSeen = sessionStorage.getItem('scrambl_intro_seen');
    if (introSeen) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('scrambl_intro_seen', 'true');
  };

  // Achievement toast queue system
  const triggerAchievementCheck = useCallback(() => {
    const newlyUnlocked = checkAchievements();
    if (newlyUnlocked.length > 0) {
      setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
    }
  }, []);

  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [currentAchievement, achievementQueue]);

  const handleAchievementDone = useCallback(() => {
    setCurrentAchievement(null);
  }, []);

  if (loading) return <div className="loading-screen">Loading Word Scrambl…</div>;

  return (
    <>
      {showIntro && <IntroAnimation onFinish={handleIntroFinish} />}
      
      {/* Global Achievement Toast */}
      <AchievementToast achievement={currentAchievement} onDone={handleAchievementDone} />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      <Routes>
        <Route path="/" element={
          <EntryScreen 
            levelIndex={levelIndex}
            levelData={levelData}
            currentUser={currentUser}
            onContinue={() => navigate('/play')}
            onAuthClick={() => navigate('/login')}
          />
        } />
        <Route path="/play" element={<Game onAchievementCheck={triggerAchievementCheck} />} />
        <Route path="/daily" element={<Game isDaily={true} onAchievementCheck={triggerAchievementCheck} />} />
        <Route path="/time-attack" element={<TimeAttack onAchievementCheck={triggerAchievementCheck} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/stats" element={<PlayerStats />} />
        
        {/* Authentication */}
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Legal */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* Features */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/countries" element={<CountryNav />} />
        <Route path="/blog" element={<Blog />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Web Bottom Ad */}
      {isWeb && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {windowWidth >= 768 ? (
            <AdBanner dataKey="0e187c9adaf30e62c576ba9383c5d83c" width={728} height={90} />
          ) : (
            <AdBanner dataKey="c775086fc6aafa02000ff1d7a8ce2fd3" width={320} height={50} />
          )}
        </div>
      )}
    </>
  );
}

export default App;
