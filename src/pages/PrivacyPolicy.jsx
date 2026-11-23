import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Legal.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="legal-container animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <div className="legal-card">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: April 2026</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, including your email address. We also automatically collect certain information when you visit our site, including your IP address for country detection purposes.</p>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to maintain and improve our game, provide personalized experiences (like local country background images), and communicate with you about your account.</p>
        </section>

        <section>
          <h2>3. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies (like Google Analytics) on our website to analyze traffic. In our mobile applications, we may collect mobile device identifiers (such as Android Advertising ID) to provide advertisements through networks like Google AdMob.</p>
        </section>

        <section>
          <h2>4. Advertising</h2>
          <p>Third-party vendors, including Google, use cookies or device identifiers to serve ads based on a user's prior visits or app usage. Google's use of advertising IDs enables it and its partners to serve ads to your users based on their use of the mobile app and/or other sites on the Internet.</p>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <p>If you have questions about this policy, contact us at: kush@wordscrambl.com</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
