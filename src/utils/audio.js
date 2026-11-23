// Simple Web Audio API Synthesizer to avoid external assets
let audioCtx;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const getVolume = (type) => {
  if (type === 'bgm') {
    return localStorage.getItem('scrambl_music_enabled') === 'false' ? 0 : 0.15;
  }
  return localStorage.getItem('scrambl_sound_enabled') === 'false' ? 0 : 0.3;
};

// Play a subtle pop sound when typing
export const playPopSound = () => {
  const vol = getVolume('sfx');
  if (vol === 0) return;
  
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

// Play a nice chime when solving a word
export const playSuccessChime = () => {
  const vol = getVolume('sfx');
  if (vol === 0) return;

  const ctx = getContext();
  const now = ctx.currentTime;
  
  const playNote = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playNote(523.25, now, 0.4); // C5
  playNote(659.25, now + 0.1, 0.4); // E5
  playNote(783.99, now + 0.2, 0.6); // G5
};

// Play victory fanfare when finishing a level
export const playVictorySound = () => {
  const vol = getVolume('sfx');
  if (vol === 0) return;

  const ctx = getContext();
  const now = ctx.currentTime;

  const playNote = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playNote(440, now, 0.2); // A4
  playNote(554.37, now + 0.2, 0.2); // C#5
  playNote(659.25, now + 0.4, 0.6); // E5
  playNote(880, now + 0.6, 0.8); // A5
};

// Background Music Engine
let bgmOscillator1 = null;
let bgmOscillator2 = null;
let bgmGain = null;
let isBgmPlaying = false;

export const startBGM = () => {
  if (isBgmPlaying || localStorage.getItem('scrambl_music_enabled') === 'false') return;
  
  const ctx = getContext();
  bgmGain = ctx.createGain();
  bgmGain.gain.setValueAtTime(0, ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(getVolume('bgm'), ctx.currentTime + 2); // Fade in
  
  bgmOscillator1 = ctx.createOscillator();
  bgmOscillator2 = ctx.createOscillator();
  
  // Drone sound
  bgmOscillator1.type = 'sine';
  bgmOscillator1.frequency.value = 110; // A2
  
  bgmOscillator2.type = 'triangle';
  bgmOscillator2.frequency.value = 164.81; // E3
  
  // Subtle filter
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  
  // LFO for modulation
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // 0.1 Hz
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 50;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  
  bgmOscillator1.connect(filter);
  bgmOscillator2.connect(filter);
  filter.connect(bgmGain);
  bgmGain.connect(ctx.destination);
  
  bgmOscillator1.start();
  bgmOscillator2.start();
  isBgmPlaying = true;
};

export const stopBGM = () => {
  if (!isBgmPlaying || !bgmGain) return;
  
  const ctx = getContext();
  bgmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); // Fade out
  
  setTimeout(() => {
    if (bgmOscillator1) bgmOscillator1.stop();
    if (bgmOscillator2) bgmOscillator2.stop();
    bgmOscillator1 = null;
    bgmOscillator2 = null;
    isBgmPlaying = false;
  }, 1000);
};

export const toggleBGM = () => {
  if (localStorage.getItem('scrambl_music_enabled') === 'false') {
    stopBGM();
  } else {
    startBGM();
  }
};
