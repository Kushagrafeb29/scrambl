import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { campaignData } from './campaignData';

const StickyBanner = () => {
  useEffect(() => {
    const { googletag } = window;
    googletag?.cmd.push(() => {
      const adSlot = googletag.defineSlot('/1234567/example_banner', [320, 50], 'div-gpt-ad-banner')
        ?.addService(googletag.pubads());
      googletag.enableServices();
      googletag.display('div-gpt-ad-banner');

      const interval = setInterval(() => {
        googletag.pubads().refresh([adSlot]);
      }, 30000);

      return () => clearInterval(interval);
    });
  }, []);

  return (
    <div className="banner-anchor">
      <div id="div-gpt-ad-banner" style={{ minWidth: '320px', minHeight: '50px' }}></div>
    </div>
  );
};

const JumbleRow = ({ jumbleData, onSolve, isSolved, index }) => {
  const [guess, setGuess] = useState(new Array(jumbleData.answer.length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    setGuess(new Array(jumbleData.answer.length).fill(''));
  }, [jumbleData]);

  const handleChange = (val, charIndex) => {
    if (isSolved) return;
    const newGuess = [...guess];
    newGuess[charIndex] = val.toUpperCase();
    setGuess(newGuess);

    if (val && charIndex < jumbleData.answer.length - 1) {
      inputsRef.current[charIndex + 1]?.focus();
    }

    if (newGuess.join('') === jumbleData.answer) {
      onSolve(index, newGuess.join(''));
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

function App() {
  const [levelIndex, setLevelIndex] = useState(() => {
    const saved = localStorage.getItem('scrambl_level');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const levelData = campaignData[levelIndex];
  
  const [solvedJumbles, setSolvedJumbles] = useState([]);
  const [showMeta, setShowMeta] = useState(false);
  const [metaGuess, setMetaGuess] = useState([]);
  const metaInputsRef = useRef([]);

  useEffect(() => {
    if (levelData) {
      setSolvedJumbles(new Array(levelData.puzzle.jumbles.length).fill(null));
      setMetaGuess(new Array(levelData.puzzle.meta.answer.length).fill(''));
      setShowMeta(false);
      
      const bgUrl = `/bg_${levelData.countryId}.png`;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
    }
  }, [levelData]);

  useEffect(() => {
    localStorage.setItem('scrambl_level', levelIndex.toString());
  }, [levelIndex]);

  const isAllJumblesSolved = solvedJumbles.length > 0 && solvedJumbles.every(s => s !== null);
  const metaAnswer = levelData?.puzzle?.meta?.answer || '';
  const isMetaSolved = metaAnswer ? metaGuess.join('') === metaAnswer : false;

  const handleJumbleSolve = (index, word) => {
    const newSolved = [...solvedJumbles];
    newSolved[index] = word;
    setSolvedJumbles(newSolved);
  };

  useEffect(() => {
    if (isAllJumblesSolved && !showMeta) {
      setTimeout(() => setShowMeta(true), 800);
    }
  }, [isAllJumblesSolved]);

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

    if (val && i < levelData.puzzle.meta.answer.length - 1) {
      metaInputsRef.current[i + 1]?.focus();
    }
  };

  const handleMetaKeyDown = (e, charIndex) => {
    if (e.key === 'Backspace' && !metaGuess[charIndex] && charIndex > 0) {
      metaInputsRef.current[charIndex - 1]?.focus();
    }
  };

  const showInterstitialAd = (callback) => {
    let adCalled = false;
    const safeCallback = () => {
      if (!adCalled) {
        adCalled = true;
        callback();
      }
    };

    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      console.log("Dev Mode: Simulated Interstitial Ad shown");
      setTimeout(safeCallback, 800);
      return;
    }

    if (window.adsbygoogle) {
      window.adsbygoogle.push({
         
        type: "next",
        name: "level_transition",
        beforeAd: () => { console.log("Ad starting"); }, 
        afterAd: () => safeCallback(),
        adDismissed: () => safeCallback()
      });
      // Fallback timeout in case ad blocked
      setTimeout(safeCallback, 2500);
    } else {
      safeCallback();
    }
  };

  const advanceLevel = () => {
    const nextLevelIndex = levelIndex + 1;
    const processAdvance = () => {
      if (nextLevelIndex < campaignData.length) {
        setLevelIndex(nextLevelIndex);
      } else {
        // Technically this shouldn't be hit because button hides, but safety first
        setLevelIndex(nextLevelIndex);
      }
    };
    
    // Interstitial Ad every 3 levels (Gap of 2 levels)
    if (nextLevelIndex > 0 && nextLevelIndex % 3 === 0) {
      showInterstitialAd(processAdvance);
    } else {
      processAdvance();
    }
  };

  // Game Completed State
  if (!levelData) {
    return (
      <div className="app-container">
        <div className="glass-panel" style={{textAlign: 'center'}}>
          <h1 className="title">SCRAMBL</h1>
          <h2 style={{marginTop: '20px', color: 'var(--success-color)', fontSize: '2rem'}}>You've unscrambled the whole world! 🤯</h2>
          <p style={{marginTop: '15px', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.5'}}>
            Wow. We are currently cooking up more puzzles in the kitchen. We'll be back soon!
          </p>
          <button className="btn btn-primary" onClick={() => setLevelIndex(0)} style={{marginTop: '30px'}}>
            Play Again from Start
          </button>
        </div>
      </div>
    );
  }

  const showRewardedAd = () => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      setTimeout(() => grantHint(), 1500);
      return;
    }

    if (window.adsbygoogle) {
      window.adsbygoogle.push({
        google_ad_client: "ca-pub-4173109231628867",
         
        type: "rewarded",
        name: "get_hint",
        beforeReward: (showAdFn) => showAdFn(),
        adViewed: () => grantHint()
      });
    }
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
    <div className="app-container">
      <h1 className="title">SCRAMBL</h1>
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
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel meta-panel animate-fade">
          <p className="clue-text">{levelData.puzzle.meta.quote}</p>
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
                disabled={isMetaSolved}
                className={`char-input large ${isMetaSolved ? 'success' : ''}`}
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
              🎁 GET HINT
            </button>
          )}

          {isMetaSolved && (
            <div className="victory-zone animate-fade">
              <h2>PUZZLE SOLVED!</h2>
              {levelIndex < campaignData.length ? (
                <button className="btn btn-primary" onClick={advanceLevel}>
                  Next Level
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
      
      <StickyBanner />
    </div>
  );
}

export default App;
