import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';

const ScrambleText = ({ text, duration = 2000 }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 10;
    }, duration / (text.length * 10));

    return () => clearInterval(interval);
  }, [text, duration]);

  return <span>{displayText}</span>;
};

const IntroAnimation = ({ onFinish }) => {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Studio card ~1.7s, then the game title card; ~4s total, tap anywhere to skip
    const phaseTimer = setTimeout(() => {
      setPhase(2);
    }, 1700);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="intro-container" onClick={onFinish} role="button" aria-label="Skip intro">
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div 
            key="phase1"
            className="intro-content company-phase"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src="/gooddude_logo.png" alt="GoodDude Studios" className="company-logo" />
            <p className="company-presents">presents</p>
          </motion.div>
        )}
        
        {phase === 2 && (
          <motion.div 
            key="phase2"
            className="intro-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src="/word_scrambl_logo.png" alt="Word Scrambl Logo" className="game-logo" />
            <h1 className="intro-title">
              <ScrambleText text="WORD SCRAMBL" duration={1400} />
            </h1>
            <motion.div 
              className="intro-loader"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, delay: 0.2, ease: "easeInOut" }}
            />
            <motion.p 
              className="intro-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Unscramble the World
            </motion.p>
            <p className="intro-skip">Tap to skip</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroAnimation;
