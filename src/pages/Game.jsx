import React, { useState, useEffect, useRef } from 'react';
import { campaignData } from '../campaignData';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Gift, ChevronRight, Trophy, Bug, BookOpen, Share2, ChevronLeft } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logGameEvent, logEvent } from '../utils/analytics';
import { recordLevelComplete, recordDefinitionRead } from '../utils/playerStats';
import ReportBug from '../components/ReportBug';
import TutorialOverlay from '../components/TutorialOverlay';
import Confetti from '../components/Confetti';
import { AdMob, BannerAdSize, BannerAdPosition, RewardAdPluginEvents } from '@capacitor-community/admob';

// true only in the closed-testing build (npm run build:android:test) so testers see Google test ads
const ADMOB_TESTING = import.meta.env.VITE_ADMOB_TESTING === 'true';
import { Capacitor } from '@capacitor/core';
import { playPopSound, playSuccessChime, playVictorySound } from '../utils/audio';
import '../App.css';

// StickyBanner removed for Monetag integration

import { WEB_ADS_ENABLED } from '../utils/buildTarget';

// Adsterra smartlink: website only. Compiled out of Android (AdMob-only) and portal builds.
const SMARTLINK_URL = WEB_ADS_ENABLED ? "https://www.effectivecpmnetwork.com/cubvc6j8?key=b4a745e0a1cd15fc948537eb585d9f31" : null;

const JumbleRow = ({ jumbleData, onSolve, isSolved, index, onBonusWord }) => {
  const [guess, setGuess] = useState(new Array(jumbleData.answer.length).fill(''));
  const inputsRef = useRef([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setGuess(new Array(jumbleData.answer.length).fill(''));
  }, [jumbleData]);

  const handleChange = async (val, charIndex) => {
    if (isSolved || isChecking) return;
    const newGuess = [...guess];
    newGuess[charIndex] = val.toUpperCase();
    setGuess(newGuess);
    if (val) playPopSound();

    if (val && charIndex < jumbleData.answer.length - 1) {
      inputsRef.current[charIndex + 1]?.focus();
    }

    const guessedWord = newGuess.join('');
    if (guessedWord.length === jumbleData.answer.length) {
      if (guessedWord === jumbleData.answer) {
        onSolve(index, guessedWord);
      } else {
        const jumbleChars = jumbleData.jumble.split('').sort().join('');
        const guessChars = guessedWord.split('').sort().join('');
        if (jumbleChars === guessChars && onBonusWord) {
          setIsChecking(true);
          const isBonus = await onBonusWord(guessedWord);
          setIsChecking(false);
          if (isBonus) {
            setGuess(new Array(jumbleData.answer.length).fill(''));
            setTimeout(() => {
              if (inputsRef.current[0]) inputsRef.current[0].focus();
            }, 50);
          }
        }
      }
    }
  };

  const handleKeyDown = (e, charIndex) => {
    if (e.key === 'Backspace' && !guess[charIndex] && charIndex > 0) {
      inputsRef.current[charIndex - 1]?.focus();
    }
  };

  return (
    <div className={`jumble-row ${isSolved ? 'solved' : ''} animate-fade`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="jumble-clue">{jumbleData.jumble}</div>
      <div className="input-group">
        {jumbleData.answer.split('').map((_, i) => (
          <div key={i} className={`input-wrapper ${jumbleData.circles.includes(i) ? 'circled' : ''}`}>
            <input
              ref={el => inputsRef.current[i] = el}
              type="text"
              maxLength="1"
              value={guess[i]}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={isSolved}
              className="char-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function Game({ isDaily = false, onAchievementCheck }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showBugReport, setShowBugReport] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelIndex, setLevelIndex] = useState(() => {
    if (isDaily) {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      return dayOfYear % campaignData.length;
    }
    const saved = localStorage.getItem('scrambl_level');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const levelData = campaignData[levelIndex];
  
  const [solvedJumbles, setSolvedJumbles] = useState([]);
  const [showMeta, setShowMeta] = useState(false);
  const [metaGuess, setMetaGuess] = useState([]);
  const [metaHint, setMetaHint] = useState("");
  const [wordDefinition, setWordDefinition] = useState(null);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [isAdFree, setIsAdFree] = useState(() => localStorage.getItem('scrambl_no_ads') === 'true');
  const [bonusNotification, setBonusNotification] = useState(null);
  const metaInputsRef = useRef([]);

  const handleBonusWord = async (word) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (res.ok) {
        const coinsEarned = word.length;
        const currentCoins = parseInt(localStorage.getItem('scrambl_coins') || '0', 10);
        localStorage.setItem('scrambl_coins', (currentCoins + coinsEarned).toString());
        playSuccessChime();
        setBonusNotification(`✨ Bonus Word: ${word} (+${coinsEarned} Coins)`);
        setTimeout(() => setBonusNotification(null), 2500);
        return true;
      }
    } catch (e) {
      // Ignore network errors
    }
    return false;
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform() && !isAdFree) {
      AdMob.initialize({
        initializeForTesting: ADMOB_TESTING,
      }).then(async () => {
        try {
          await AdMob.showBanner({
            adId: 'ca-app-pub-4173109231628867/6076498960',
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: ADMOB_TESTING
          });
        } catch (e) {
          console.error("AdMob Banner failed to load", e);
        }
      }).catch(err => console.error("AdMob Init Error", err));
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
         AdMob.hideBanner().catch(() => {});
      }
    };
  }, [isAdFree]);

  useEffect(() => {
    if (levelData) {
      setSolvedJumbles(new Array(levelData.puzzle.jumbles.length).fill(null));
      setMetaGuess(new Array(levelData.puzzle.meta.answer.length).fill(''));
      setShowMeta(false);
      setShowConfetti(false);
      
      if (isDaily) {
        // Daily mode always gets a vibrant dedicated gradient
        document.body.style.backgroundImage = 'none';
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)';
      } else {
        const bgUrl = `/bg_${levelData.countryId}.png`;
        const img = new Image();
        img.onload = () => {
          document.body.style.background = '';
          document.body.style.backgroundImage = `url('${bgUrl}')`;
        };
        img.onerror = () => {
          document.body.style.backgroundImage = 'none';
          document.body.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        };
        img.src = bgUrl;
      }
    }
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.background = '';
    };
  }, [levelData, isDaily]);

  useEffect(() => {
    if (!isDaily) {
      localStorage.setItem('scrambl_level', levelIndex.toString());
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, { campaignLevel: levelIndex, displayName: currentUser.displayName || currentUser.email.split('@')[0] }, { merge: true });
      }
    }
  }, [levelIndex, isDaily, currentUser]);

  const isAllJumblesSolved = solvedJumbles.length > 0 && solvedJumbles.every(s => s !== null);
  const metaAnswer = levelData?.puzzle?.meta?.answer || '';
  const isMetaSolved = metaAnswer ? metaGuess.join('') === metaAnswer : false;

  const handleJumbleSolve = (index, word) => {
    const newSolved = [...solvedJumbles];
    newSolved[index] = word;
    setSolvedJumbles(newSolved);
    playSuccessChime();
  };

  useEffect(() => {
    if (isAllJumblesSolved && !showMeta) {
      const timer = setTimeout(() => {
        setShowMeta(true);
        // Auto-hint the first letter to reduce difficulty
        const answer = levelData.puzzle.meta.answer;
        if (answer) {
          const newGuess = new Array(answer.length).fill('');
          newGuess[0] = answer[0];
          setMetaGuess(newGuess);
          
          // Fetch dynamic hint and word definition
          fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${answer.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.length > 0 && data[0].meanings.length > 0) {
                const meaning = data[0].meanings[0];
                const definition = meaning.definitions[0].definition;
                setMetaHint(`Hint: ${definition}`);
                // Store full definition for post-solve display
                setWordDefinition({
                  word: answer,
                  partOfSpeech: meaning.partOfSpeech || '',
                  definition: definition,
                  example: meaning.definitions[0].example || '',
                  phonetic: data[0].phonetic || (data[0].phonetics && data[0].phonetics.find(p => p.text)?.text) || '',
                });
              } else {
                setMetaHint("");
                setWordDefinition(null);
              }
            })
            .catch(() => { setMetaHint(""); setWordDefinition(null); });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAllJumblesSolved, showMeta, levelData]);

  // Trigger confetti and achievement check when meta is solved
  useEffect(() => {
    if (isMetaSolved) {
      setShowConfetti(true);
      playVictorySound();
      recordLevelComplete();
      
      // Track definition read
      if (wordDefinition) {
        recordDefinitionRead();
      }

      // Check for early bird (daily before noon)
      if (isDaily && new Date().getHours() < 12) {
        localStorage.setItem('scrambl_early_bird', 'true');
      }

      // Trigger achievement check with slight delay for visual effect
      setTimeout(() => {
        onAchievementCheck?.();
      }, 1500);

      // Stop confetti after a bit
      const confettiTimer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(confettiTimer);
    }
  }, [isMetaSolved]);

  const getCircledLetters = () => {
    let letters = [];
    levelData.puzzle.jumbles.forEach((j, idx) => {
      const solvedWord = solvedJumbles[idx];
      if (solvedWord) {
        j.circles.forEach(circleIdx => {
          letters.push(solvedWord[circleIdx]);
        });
      }
    });
    return letters.sort(() => Math.random() - 0.5);
  };

  const handleMetaChange = (val, i) => {
    if (isMetaSolved) return;
    const newGuess = [...metaGuess];
    newGuess[i] = val.toUpperCase();
    setMetaGuess(newGuess);
    if (val) playPopSound();

    if (val && i < levelData.puzzle.meta.answer.length - 1) {
      metaInputsRef.current[i + 1]?.focus();
    }
  };

  const handleMetaKeyDown = (e, charIndex) => {
    if (e.key === 'Backspace' && !metaGuess[charIndex] && charIndex > 1) { // Stop at index 1 because index 0 is auto-hinted
      metaInputsRef.current[charIndex - 1]?.focus();
    }
  };

  const showInterstitialAd = async (callback) => {
    let adCalled = false;
    const safeCallback = () => {
      if (!adCalled) {
        adCalled = true;
        callback();
      }
    };

    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.prepareInterstitial({
           adId: 'ca-app-pub-4173109231628867/7253849260',
           isTesting: ADMOB_TESTING
        });
        await AdMob.showInterstitial();
        // The ad closes eventually, but we can safely call callback right after show returns or add listeners.
        // For simplicity, calling safeCallback immediately after showing starts.
        safeCallback();
      } catch (e) {
        console.error("AdMob Interstitial failed", e);
        safeCallback();
      }
      return;
    }

    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      setTimeout(safeCallback, 800);
      return;
    }

    if (!SMARTLINK_URL) { safeCallback(); return; }

    // Adsterra Smartlink Interstitial Fallback for Web
    // Pop up ad in a new tab, then proceed to the next level
    window.open(SMARTLINK_URL, '_blank');
    safeCallback();
  };

  const handleShare = async () => {
    const streak = parseInt(localStorage.getItem('scrambl_daily_streak') || '0', 10);
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const streakEmojis = Array(Math.min(streak, 10)).fill('🔥').join('');
    
    const shareText = [
      `🌍 Scrambl Daily #${dayOfYear}`,
      `🔥 Streak: ${streak} ${streakEmojis}`,
      `🟩🟩🟩🟩🟩 Solved!`,
      ``,
      `Can you unscramble the world?`,
      `▶️ https://wordscrambl.com`
    ].join('\n');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scrambl Daily Challenge',
          text: shareText
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      // Show a brief visual confirmation instead of an ugly alert()
      const btn = document.querySelector('.share-btn-daily');
      if (btn) {
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Share Results'; }, 2000);
      }
    }
  };

  const advanceLevel = () => {
    if (isDaily) {
      const todayStr = new Date().toDateString();
      const lastDaily = localStorage.getItem('scrambl_last_daily');
      if (lastDaily !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let streak = parseInt(localStorage.getItem('scrambl_daily_streak') || '0', 10);
        if (lastDaily === yesterday.toDateString()) {
          streak += 1;
        } else {
          streak = 1;
        }
        localStorage.setItem('scrambl_daily_streak', streak.toString());
        localStorage.setItem('scrambl_last_daily', todayStr);
      }
      
      const currentCoins = parseInt(localStorage.getItem('scrambl_coins') || '0', 10);
      localStorage.setItem('scrambl_coins', (currentCoins + 5).toString());
      
      navigate('/');
      return;
    }

    const nextLevelIndex = levelIndex + 1;
    logGameEvent(levelIndex + 1, "Level Complete");
    
    // Grant coins
    const currentCoins = parseInt(localStorage.getItem('scrambl_coins') || '0', 10);
    localStorage.setItem('scrambl_coins', (currentCoins + 2).toString());
    
    const processAdvance = () => {
      if (nextLevelIndex < campaignData.length) {
        setLevelIndex(nextLevelIndex);
      } else {
        setLevelIndex(nextLevelIndex);
      }
    };
    
    if (!isAdFree && nextLevelIndex > 0 && nextLevelIndex % 3 === 0) {
      showInterstitialAd(processAdvance);
    } else {
      processAdvance();
    }
  };

  if (!levelData) {
    return (
      <div className="app-container">
        <Helmet>
          <title>{`Victory! | SCRAMBL`}</title>
        </Helmet>
        <div className="glass-panel" style={{textAlign: 'center'}}>
          <Trophy size={64} color="var(--success-color)" style={{marginBottom: '20px'}} />
          <h1 className="title">SCRAMBL</h1>
          <h2 style={{marginTop: '20px', color: 'var(--success-color)', fontSize: '2rem'}}>You've unscrambled the whole world! 🤯</h2>
          <p style={{marginTop: '15px', color: 'var(--text-secondary)', fontSize: '1.2rem'}}>
            Wow. We are currently cooking up more puzzles in the kitchen. We'll be back soon!
          </p>
          <button className="btn btn-primary" onClick={() => setLevelIndex(0)} style={{marginTop: '30px'}}>
            Play Again from Start
          </button>
        </div>
      </div>
    );
  }

  const showRewardedAd = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Register listeners BEFORE preparing/showing the ad
        const rewardListener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          () => {
            grantHint();
          }
        );

        // Clean up all listeners when ad closes to prevent duplicates
        const closeListener = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          () => {
            rewardListener.remove();
            closeListener.remove();
          }
        );

        await AdMob.prepareRewardVideoAd({
           adId: 'ca-app-pub-4173109231628867/9193616890',
           isTesting: ADMOB_TESTING
        });
        
        await AdMob.showRewardVideoAd();
      } catch (e) {
        console.error("AdMob Rewarded failed", e);
        // Fallback grant if ad fails to load
        grantHint();
      }
      return;
    }

    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      setTimeout(() => grantHint(), 1500);
      return;
    }

    if (!SMARTLINK_URL) { grantHint(); return; }

    // Adsterra Smartlink Rewarded Click for Web
    // Open ad in a new tab, then grant the hint as a reward
    window.open(SMARTLINK_URL, '_blank');
    grantHint();
  };

  const grantHint = () => {
    const emptyIndices = metaGuess.map((g, idx) => g === '' ? idx : null).filter(idx => idx !== null);
    if (emptyIndices.length > 0) {
      const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newGuess = [...metaGuess];
      newGuess[randomIdx] = levelData.puzzle.meta.answer[randomIdx];
      setMetaGuess(newGuess);
    }
  };

  return (
    <div className={`app-container ${isTutorialActive ? 'tutorial-active' : ''}`}>
      <Helmet>
        <title>{`${levelData.countryName} - Level ${levelIndex + 1} | SCRAMBL`}</title>
        <meta name="description" content={`Unscramble words from ${levelData.countryName} and solve the meta-puzzle!`} />
      </Helmet>

      {/* Confetti */}
      <Confetti active={showConfetti} />

      {levelIndex === 0 && (
        <TutorialOverlay onComplete={() => setIsTutorialActive(false)} />
      )}

      {bonusNotification && (
        <div className="bonus-toast animate-slide-up" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white',
          padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', zIndex: 1000,
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)', fontSize: '1.1rem', pointerEvents: 'none'
        }}>
          {bonusNotification}
        </div>
      )}

      <div className="header-nav" style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <button className="btn-icon" onClick={() => navigate('/')} title="Back to Menu">
          <ChevronLeft size={24} />
        </button>
      </div>

      <h1 className="title" style={{marginTop: '40px'}}>SCRAMBL</h1>
      <div className="level-indicator">
        {levelData.countryName} - Level {levelIndex + 1}
      </div>
      
      {!showMeta ? (
        <div className="jumbles-container">
          {levelData.puzzle.jumbles.map((j, i) => (
            <JumbleRow
              key={`${levelIndex}-${i}`}
              index={i}
              jumbleData={j}
              isSolved={solvedJumbles[i] !== null}
              onSolve={handleJumbleSolve}
              onBonusWord={handleBonusWord}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel meta-panel animate-fade">
          <p className="clue-text">{metaHint || levelData.puzzle.meta.quote}</p>
          <div className="meta-inputs">
            {levelData.puzzle.meta.answer.split('').map((_, i) => (
              <input
                key={`meta-${levelIndex}-${i}`}
                ref={el => metaInputsRef.current[i] = el}
                type="text"
                maxLength="1"
                value={metaGuess[i]}
                onChange={(e) => handleMetaChange(e.target.value, i)}
                onKeyDown={(e) => handleMetaKeyDown(e, i)}
                disabled={isMetaSolved || i === 0} // First letter is disabled because it's auto-hinted
                className={`char-input large ${isMetaSolved ? 'success' : ''} ${i === 0 ? 'hinted' : ''}`}
              />
            ))}
          </div>
          
          <div className="available-letters">
            {getCircledLetters().map((l, i) => (
              <span key={i} className="letter-pill">{l}</span>
            ))}
          </div>
          
          {!isMetaSolved && (
            <button className="hint-btn" onClick={showRewardedAd}>
              <Gift size={18} /> GET HINT
            </button>
          )}

          {isMetaSolved && (
            <div className="victory-zone animate-fade" style={{ textAlign: 'center', padding: '20px 10px' }}>
              <h2 style={{ fontSize: '2rem', color: '#10b981', marginBottom: '10px' }}>IQ TEST PASSED! 🧠</h2>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text-color)' }}>
                Congratulations! You scored in the top 1% and qualify for a FREE McDonald's Meal! 🍔
              </p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = 'https://www.mobilerewards.link/view.php?id=5546431&pub=3358108'}
                style={{ 
                  fontSize: '1.3rem', 
                  padding: '18px', 
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  animation: 'pulse 1.5s infinite',
                  width: '100%'
                }}
              >
                🎁 CLAIM PRIZE NOW
              </button>
              <style>{`
                @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                  100% { transform: scale(1); }
                }
              `}</style>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
