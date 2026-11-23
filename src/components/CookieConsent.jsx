import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import './CookieConsent.css';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('scrambl_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('scrambl_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('scrambl_cookie_consent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner animate-slide-up">
      <div className="cookie-content">
        <ShieldCheck className="cookie-icon" size={24} />
        <p>
          We use cookies to enhance your experience and analyze traffic. 
          By playing, you agree to our <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="btn-reject" onClick={handleReject}>Reject</button>
        <button className="btn-accept" onClick={handleAccept}>Accept All</button>
        <button className="btn-close" onClick={() => setShow(false)}><X size={18} /></button>
      </div>
    </div>
  );
};

export default CookieConsent;
