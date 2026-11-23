import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (localStorage.getItem('scrambl_pwa_dismissed') === 'true') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Track visits
    const visits = parseInt(localStorage.getItem('scrambl_visits') || '0', 10) + 1;
    localStorage.setItem('scrambl_visits', visits.toString());

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 3+ visits
      if (visits >= 3) {
        setTimeout(() => setShowBanner(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('scrambl_pwa_dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('scrambl_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="install-prompt animate-fade">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">
          <Download size={22} />
        </div>
        <div className="install-prompt-text">
          <strong>Install Scrambl</strong>
          <span>Play offline, faster loads, no browser bar!</span>
        </div>
      </div>
      <div className="install-prompt-actions">
        <button className="install-btn" onClick={handleInstall}>Install</button>
        <button className="dismiss-btn" onClick={handleDismiss}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
