import React, { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#fbbf24', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

const Confetti = ({ active, duration = 3000 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const createParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        decay: 0.003 + Math.random() * 0.005,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    if (!active) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particlesRef.current.forEach(p => {
        if (p.opacity <= 0) return;
        alive = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    const timer = setTimeout(() => {
      // Start fading out remaining particles
      particlesRef.current.forEach(p => {
        p.decay = 0.02;
      });
    }, duration - 800);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timer);
    };
  }, [active, duration, createParticles]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default Confetti;
