import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Legal.css';

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="legal-container animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <div className="legal-card">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: April 2026</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or playing Word Scrambl, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2>2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        </section>

        <section>
          <h2>3. Intellectual Property</h2>
          <p>All game content, including puzzles, graphics, and animations, are the property of GoodDude Studios and protected by copyright laws.</p>
        </section>

        <section>
          <h2>4. Prohibited Conduct</h2>
          <p>You agree not to attempt to cheat, hack, or disrupt the service. Any such activity may result in account termination.</p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>Word Scrambl is provided "as is" without any warranties. We are not liable for any damages arising from your use of the game.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
