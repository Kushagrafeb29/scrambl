import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Coins, Zap, Star, ShieldCheck, Crown, Heart } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import '../App.css';

// Google Play Billing Product IDs
const PRODUCT_IDS = {
  REMOVE_ADS: 'scrambl_remove_ads',
  COINS_100: 'scrambl_coins_100',
  COINS_500: 'scrambl_coins_500',
  COINS_1000: 'scrambl_coins_1000',
};

const Shop = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [isAdFree, setIsAdFree] = useState(false);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    const currentCoins = parseInt(localStorage.getItem('scrambl_coins') || '0', 10);
    setCoins(currentCoins);
    setIsAdFree(localStorage.getItem('scrambl_no_ads') === 'true');
  }, []);

  const grantCoins = (amount) => {
    const currentCoins = parseInt(localStorage.getItem('scrambl_coins') || '0', 10);
    const newTotal = currentCoins + amount;
    localStorage.setItem('scrambl_coins', newTotal.toString());
    setCoins(newTotal);
  };

  // Google Play Billing (cordova-plugin-purchase) is not bundled yet; until it is, paid items show as "Soon".
  const billingReady = typeof window !== 'undefined' && !!window.CdvPurchase;
  const priceLabel = (price) => (billingReady ? price : 'Soon');

  const handlePurchase = async (productId) => {
    setPurchasing(productId);

    // On native Android, trigger Google Play Billing
    if (Capacitor.isNativePlatform()) {
      try {
        // Google Play Billing via CdvPurchase (cordova-plugin-purchase)
        if (window.CdvPurchase) {
          const store = window.CdvPurchase.store;
          const product = store.get(productId, window.CdvPurchase.Platform.GOOGLE_PLAY);
          if (product) {
            const offer = product.getOffer();
            if (offer) {
              await store.order(offer);
            }
          }
        }
        // No billing plugin installed yet: never hand out paid items for free on Android.
      } catch (e) {
        console.error('Purchase failed:', e);
        alert('Purchase failed. Please try again.');
      }
    } else {
      // Web/dev fallback: simulate purchase
      simulatePurchase(productId);
    }

    setPurchasing(null);
  };

  const simulatePurchase = (productId) => {
    switch (productId) {
      case PRODUCT_IDS.REMOVE_ADS:
        localStorage.setItem('scrambl_no_ads', 'true');
        setIsAdFree(true);
        alert('🎉 Ads removed! Enjoy your ad-free experience.');
        break;
      case PRODUCT_IDS.COINS_100:
        grantCoins(100);
        alert('🪙 +100 Coins added!');
        break;
      case PRODUCT_IDS.COINS_500:
        grantCoins(500);
        alert('🪙 +500 Coins added!');
        break;
      case PRODUCT_IDS.COINS_1000:
        grantCoins(1000);
        alert('🪙 +1000 Coins added!');
        break;
      default:
        break;
    }
  };

  // Initialize Google Play Billing store on native
  useEffect(() => {
    if (Capacitor.isNativePlatform() && window.CdvPurchase) {
      const { store, ProductType, Platform } = window.CdvPurchase;

      // Register products
      store.register([
        { id: PRODUCT_IDS.REMOVE_ADS, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY },
        { id: PRODUCT_IDS.COINS_100, type: ProductType.CONSUMABLE, platform: Platform.GOOGLE_PLAY },
        { id: PRODUCT_IDS.COINS_500, type: ProductType.CONSUMABLE, platform: Platform.GOOGLE_PLAY },
        { id: PRODUCT_IDS.COINS_1000, type: ProductType.CONSUMABLE, platform: Platform.GOOGLE_PLAY },
      ]);

      // Handle approved purchases
      store.when().approved((transaction) => {
        const productId = transaction.products[0]?.id;
        switch (productId) {
          case PRODUCT_IDS.REMOVE_ADS:
            localStorage.setItem('scrambl_no_ads', 'true');
            setIsAdFree(true);
            break;
          case PRODUCT_IDS.COINS_100:
            grantCoins(100);
            break;
          case PRODUCT_IDS.COINS_500:
            grantCoins(500);
            break;
          case PRODUCT_IDS.COINS_1000:
            grantCoins(1000);
            break;
        }
        transaction.finish();
      });

      // Restore previous purchases (e.g. Remove Ads)
      store.when().verified((receipt) => {
        receipt.finish();
      });

      store.initialize([Platform.GOOGLE_PLAY]);
    }
  }, []);

  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="app-container">
        <div className="header-nav">
          <button className="btn-icon" onClick={() => navigate('/')}>
            <ChevronLeft size={24} />
          </button>
          <div className="coin-display">
            <Coins size={20} color="#FFD700" />
            <span>{coins}</span>
          </div>
        </div>
        
        <h1 className="title">SUPPORT</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Help keep Scrambl free and ad-light!
        </p>

        {!billingReady && (
        <p style={{ textAlign: 'center', color: '#FFD700', marginBottom: '20px' }}>
          In-app purchases are coming soon. Watch a short video in-game for free hints!
        </p>
      )}

      <div className="shop-grid">
          <div className="shop-item glass-panel featured">
            <div className="shop-badge" style={{background: '#e94560'}}>SUPPORT INDIE DEV</div>
            <Heart size={48} color="#e94560" className="item-icon" />
            <h3>Buy Me a Coffee</h3>
            <p>If you're enjoying the game, consider buying me a coffee to support future updates and server costs!</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.open('https://ko-fi.com/scrambl', '_blank')}
            >
              ☕ Support Developer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header-nav">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
        <div className="coin-display">
          <Coins size={20} color="#FFD700" />
          <span>{coins}</span>
        </div>
      </div>
      
      <h1 className="title">SHOP</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Power up your puzzle adventure!
      </p>

      <div className="shop-grid">
        {/* Remove Ads - Featured */}
        <div className="shop-item glass-panel featured">
          <div className="shop-badge">MOST POPULAR</div>
          <ShieldCheck size={48} color="#10b981" className="item-icon" />
          <h3>Remove Ads</h3>
          <p>Enjoy a clean, distraction-free puzzle experience forever.</p>
          {isAdFree ? (
            <button className="btn btn-success" disabled>
              ✓ Purchased
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => handlePurchase(PRODUCT_IDS.REMOVE_ADS)}
              disabled={!billingReady || purchasing === PRODUCT_IDS.REMOVE_ADS}
            >
              {purchasing === PRODUCT_IDS.REMOVE_ADS ? 'Processing...' : priceLabel('$2.99')}
            </button>
          )}
        </div>

        {/* Coin Packs */}
        <div className="shop-item glass-panel">
          <Zap size={48} color="#e94560" className="item-icon" />
          <h3>100 Coins</h3>
          <p>A quick boost.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePurchase(PRODUCT_IDS.COINS_100)}
            disabled={!billingReady || purchasing === PRODUCT_IDS.COINS_100}
          >
            {purchasing === PRODUCT_IDS.COINS_100 ? '...' : priceLabel('$0.99')}
          </button>
        </div>

        <div className="shop-item glass-panel">
          <Star size={48} color="#FFD700" className="item-icon" />
          <h3>500 Coins</h3>
          <p>A pocket full of gold.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePurchase(PRODUCT_IDS.COINS_500)}
            disabled={!billingReady || purchasing === PRODUCT_IDS.COINS_500}
          >
            {purchasing === PRODUCT_IDS.COINS_500 ? '...' : priceLabel('$2.99')}
          </button>
        </div>
        
        <div className="shop-item glass-panel">
          <Crown size={48} color="#a855f7" className="item-icon" />
          <h3>1000 Coins</h3>
          <p>The ultimate treasure chest.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePurchase(PRODUCT_IDS.COINS_1000)}
            disabled={!billingReady || purchasing === PRODUCT_IDS.COINS_1000}
          >
            {purchasing === PRODUCT_IDS.COINS_1000 ? '...' : priceLabel('$4.99')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop;
