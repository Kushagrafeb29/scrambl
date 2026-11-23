import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Timer, Trophy, ChevronLeft, XCircle, Zap, Share2, Copy } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { campaignData } from '../campaignData';
import { logGameEvent } from '../utils/analytics';
import { recordTimeAttackScore } from '../utils/playerStats';
import { playPopSound, playSuccessChime, playVictorySound } from '../utils/audio';
import Confetti from '../components/Confetti';
import '../App.css';

// Extract all jumbles from campaignData to create categorized pools
const generateWordPool = () => {
  const pool = { easy: [], medium: [], hard: [] };
  campaignData.forEach(country => {
    country.puzzle.jumbles.forEach(j => {
      const len = j.answer.length;
      if (len === 4) pool.easy.push(j);
      else if (len === 5 || len === 6) pool.medium.push(j);
      else if (len >= 7 && len <= 8) pool.hard.push(j);
    });
  });
  return pool;
};

const TimeAttack = ({ onAchievementCheck }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const wordPool = useMemo(() => generateWordPool(), []);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [guess, setGuess] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputsRef = useRef([]);

  // Set fullscreen dark background like Daily Challenge
  useEffect(() => {
    document.body.style.backgroundImage = 'none';
    document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)';
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.background = '';
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsGameOver(true);
      setShowConfetti(true);
      playVictorySound();
      logGameEvent(score, "Time Attack Complete");
      recordTimeAttackScore(score);
      setTimeout(() => onAchievementCheck?.(), 500);
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Save high score to Firebase
      if (currentUser) {
        const saveScore = async () => {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentHigh = userSnap.data().timeAttackHighScore || 0;
            if (score > currentHigh) {
              await setDoc(userRef, { timeAttackHighScore: score, displayName: currentUser.displayName || currentUser.email.split('@')[0] }, { merge: true });
            }
          } else {
            await setDoc(userRef, { timeAttackHighScore: score, displayName: currentUser.displayName || currentUser.email.split('@')[0], email: currentUser.email }, { merge: true });
          }
        };
        saveScore();
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, currentUser]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setShowConfetti(false);
    setIsPlaying(true);
    pickNextWord(0);
  };

  const pickNextWord = (currentScore = score) => {
    // Sine wave difficulty curve: starting at 0 (Easy) peaking at pi/2 (Hard)
    // 0: Easy, 1: Medium, 2: Hard, 3: Medium (cycle length of 4)
    const cycle = Math.max(0, currentScore) % 4;
    let activePool = wordPool.medium; // fallback
    
    if (cycle === 0) activePool = wordPool.easy;
    else if (cycle === 1 || cycle === 3) activePool = wordPool.medium;
    else activePool = wordPool.hard;

    // Safety fallback if a pool is empty
    if (!activePool || activePool.length === 0) activePool = wordPool.medium;

    const randomIdx = Math.floor(Math.random() * activePool.length);
    const selected = activePool[randomIdx];
    setCurrentWord(selected);
    setGuess(new Array(selected.answer.length).fill(''));
    setTimeout(() => {
      if (inputsRef.current[0]) inputsRef.current[0].focus();
    }, 50);
  };

  const handleChange = (val, i) => {
    if (!isPlaying) return;
    const newGuess = [...guess];
    newGuess[i] = val.toUpperCase();
    setGuess(newGuess);
    if (val) playPopSound();

    if (val && i < currentWord.answer.length - 1) {
      inputsRef.current[i + 1]?.focus();
    }

    if (newGuess.join('') === currentWord.answer) {
      setScore(s => s + 1);
      setTimeLeft(t => t + 3);
      playSuccessChime();
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
      const nextScore = score + 1;
      setTimeout(() => pickNextWord(nextScore), 300);
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !guess[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleSkip = () => {
    if (!isPlaying) return;
    const nextScore = Math.max(0, score - 1);
    setScore(nextScore);
    playPopSound();
    pickNextWord(nextScore);
  };

  const handleShare = async () => {
    const scoreEmojis = Array(Math.min(score, 20)).fill('🟩').join('');
    const padding = Array(Math.max(0, 20 - score)).fill('⬜').join('');
    const rating = score > 10 ? '🤯 BEAST MODE' : score > 5 ? '🔥 On Fire' : '💪 Warming Up';
    
    const shareText = [
      `⚡ Scrambl Time Attack`,
      `Score: ${score} | ${rating}`,
      `${scoreEmojis}${padding}`,
      ``,
      `Can you beat my score?`,
      `▶️ https://wordscrambl.com/time-attack`
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Scrambl Time Attack', text: shareText });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const timerPct = (timeLeft / 60) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh', 
      padding: '0 20px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'transparent'
    }}>
      <Helmet>
        <title>Time Attack | SCRAMBL</title>
      </Helmet>

      <Confetti active={showConfetti} />

      {/* Header — matches Daily Challenge */}
      <h1 className="title" style={{ color: '#2a9d8f', marginTop: '20px' }}>SCRAMBL</h1>
      <div className="level-indicator" style={{ color: 'rgba(255,255,255,0.6)' }}>
        <Zap size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
        TIME ATTACK
      </div>

      {!isPlaying && !isGameOver ? (
        /* ---------- START SCREEN ---------- */
        <div style={{ 
          textAlign: 'center', 
          marginTop: '12vh',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 25px',
            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
          }}>
            <Timer size={48} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '8px' }}>Time Attack</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 30px', lineHeight: '1.6' }}>
            Unscramble as many words as you can in 60 seconds.<br/>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>+1 Score & +3s</span> for correct answers.<br/>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-1 Score</span> for skipping.
          </p>
          <button className="btn btn-primary" onClick={startGame} style={{ 
            fontSize: '1.2rem', padding: '18px 40px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.3)',
            letterSpacing: '2px'
          }}>
            ⚡ START
          </button>
        </div>

      ) : isGameOver ? (
        /* ---------- GAME OVER SCREEN ---------- */
        <div className="glass-panel meta-panel animate-fade" style={{ 
          marginTop: '6vh',
          background: 'white',
          maxWidth: '420px',
          width: '100%',
          padding: '40px 30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            width: '80px', height: '80px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 15px',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
          }}>
            <Trophy size={40} color="white" />
          </div>
          <h2 style={{ color: '#1e293b', fontSize: '1.6rem', margin: '0 0 5px' }}>Time's Up!</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500', margin: 0 }}>
            {score > 10 ? "You're a human dictionary! 🤯" : score > 5 ? "Great job! 🔥" : "Keep practicing! 💪"}
          </p>
          <div style={{ 
            fontSize: '5rem', fontWeight: '900', 
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '10px 0 25px', lineHeight: '1.1'
          }}>
            {score}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', width: '100%' }}>
            <button onClick={handleShare} style={{ 
              padding: '16px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 'bold', width: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s ease'
            }}>
              {copied ? <><Copy size={20} /> Copied to Clipboard!</> : <><Share2 size={20} /> Share Score</>}
            </button>
            <button className="btn btn-primary" onClick={startGame} style={{ 
              padding: '16px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 'bold', width: '100%' 
            }}>
              PLAY AGAIN
            </button>
            <button className="btn" onClick={() => navigate('/')} style={{ 
              background: '#f1f5f9', color: '#475569', padding: '16px', fontSize: '1.1rem', 
              borderRadius: '16px', fontWeight: 'bold', border: 'none', width: '100%' 
            }}>
              RETURN TO HOME
            </button>
          </div>
        </div>

      ) : (
        /* ---------- GAMEPLAY SCREEN ---------- */
        <div style={{ width: '100%', maxWidth: '500px', marginTop: '20px' }}>

          {/* Timer Bar */}
          <div style={{
            width: '100%', height: '6px', borderRadius: '3px',
            background: 'rgba(255,255,255,0.1)',
            marginBottom: '20px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${timerPct}%`,
              background: isUrgent 
                ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                : 'linear-gradient(90deg, #10b981, #34d399)',
              transition: 'width 1s linear, background 0.3s ease',
            }} />
          </div>

          {/* Timer & Score row */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '40px', color: 'white'
          }}>
            <div style={{ 
              fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px',
              color: isUrgent ? '#ef4444' : '#10b981',
              transition: 'color 0.3s ease'
            }}>
              <Timer size={22} /> 
              {timeLeft}s
              {flash && (
                <span style={{ 
                  color: '#10b981', fontSize: '0.9rem', fontWeight: '700',
                  animation: 'popIn 0.5s ease forwards',
                  marginLeft: '4px'
                }}>+3s</span>
              )}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>
              Score: <span style={{ color: '#fbbf24' }}>{score}</span>
            </div>
          </div>

          {/* Jumble Word */}
          {currentWord && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.4rem', fontWeight: '800', letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.4)', marginBottom: '30px',
                textTransform: 'uppercase'
              }}>
                {currentWord.jumble}
              </div>
              
              <div className="input-group" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                {currentWord.answer.split('').map((_, i) => (
                  <div key={i} className="input-wrapper">
                    <input
                      ref={el => inputsRef.current[i] = el}
                      type="text"
                      maxLength="1"
                      value={guess[i] || ''}
                      onChange={(e) => handleChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className={`char-input ${guess.join('') === currentWord.answer ? 'success' : ''}`}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '2px solid rgba(255,255,255,0.15)',
                        color: 'white',
                        fontSize: '1.8rem',
                        width: '50px',
                        height: '58px',
                      }}
                    />
                  </div>
                ))}
              </div>

              <button onClick={handleSkip} style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', 
                padding: '12px 24px', borderRadius: '14px',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}>
                <XCircle size={16} /> Skip (-1 Score)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back button — always visible */}
      <button onClick={() => navigate('/')} style={{
        position: 'fixed', top: '16px', left: '16px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px', width: '42px', height: '42px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
        transition: 'all 0.2s ease', zIndex: 10
      }}>
        <ChevronLeft size={22} />
      </button>
    </div>
  );
};

export default TimeAttack;
