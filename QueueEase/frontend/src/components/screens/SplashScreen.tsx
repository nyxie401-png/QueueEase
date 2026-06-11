/**
 * QueueEase V2 — Splash Screen
 * Features the ECG-to-Stethoscope canvas animation.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ECGStethoscopeAnimation from '../animations/ECGStethoscopeAnimation';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('queueease_token');
      navigate(token ? '/patient/dashboard' : '/login', { replace: true });
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-teal/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        <ECGStethoscopeAnimation width={380} height={240} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 text-center z-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="text-white">Queue</span>
          <span className="neon-text">Ease</span>
        </h1>
        <p className="mt-3 text-lg text-white/50 font-light">
          AI-Powered Smart Queue Management
        </p>
        <p className="mt-1 text-sm text-teal/60">
          For Private Doctor Clinics & Small Dispensaries
        </p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="mt-12 z-10"
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-teal"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-6 text-xs text-white/20 z-10"
      >
        v2.0.0 • Made with 💙 in Sri Lanka
      </motion.p>
    </div>
  );
}
