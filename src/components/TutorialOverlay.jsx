import React, { useState, useEffect } from 'react';
import './TutorialOverlay.css';
import { ChevronRight, Check } from 'lucide-react';

const TutorialOverlay = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('scrambl_tutorial_complete');
    if (!hasCompleted) {
      // Small delay to let game render first
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      onComplete(); // Skip if already done
    }
  }, [onComplete]);

  if (!isVisible) return null;

  const steps = [
    {
      title: "Oh, hi there!",
      text: "I'm Nutty! Welcome to Scrambl! See those jumbled words? Your goal is to unscramble them. Type the correct letters into the boxes.",
      targetClass: ".jumbles-container"
    },
    {
      title: "Look for the Circles!",
      text: "Notice the circled boxes? When you solve a word, the letters in these circles are saved for a super secret final puzzle!",
      targetClass: ".input-wrapper.circled"
    },
    {
      title: "The Final Mystery",
      text: "Once you solve all the rows, a secret puzzle appears at the bottom. Unscramble your collected letters to solve it! Have fun!",
      targetClass: ".meta-panel"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    localStorage.setItem('scrambl_tutorial_complete', 'true');
    setIsVisible(false);
    onComplete();
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-backdrop" />
      <div className={`tutorial-modal animate-pop step-${step}`}>
        <div className="mascot-container">
          <img src="/mascot.png" alt="Nutty the Squirrel" className="mascot-img" />
        </div>
        <div className="tutorial-content-box">
          <h2>{steps[step].title}</h2>
          <p>{steps[step].text}</p>
          <div className="tutorial-actions">
          <div className="tutorial-dots">
            {steps.map((_, i) => (
              <span key={i} className={`dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
          <button className="btn btn-primary tutorial-btn" onClick={handleNext}>
            {step < steps.length - 1 ? (
              <>Next <ChevronRight size={18} /></>
            ) : (
              <>Let's Play <Check size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TutorialOverlay;
