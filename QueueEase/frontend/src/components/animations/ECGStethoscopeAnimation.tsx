/**
 * QueueEase V2 — ECG to Stethoscope Canvas Animation
 * 
 * Inspired by the neon ECG-stethoscope design from image.png
 * The animation transitions from an ECG waveform into a stethoscope shape,
 * all rendered on an HTML5 Canvas with neon cyan/teal glow effects.
 */

import { useEffect, useRef } from 'react';

interface ECGStethoscopeAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function ECGStethoscopeAnimation({ 
  width = 400, 
  height = 300, 
  className = '' 
}: ECGStethoscopeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Animation parameters
    const ECG_POINTS = 200;
    const ecgData = new Float32Array(ECG_POINTS);
    let ecgPhase = 0;
    let stethoscopeProgress = 0;
    let cyclePhase = 0; // 0 = ECG, 1 = transition, 2 = stethoscope, 3 = transition back

    // ECG waveform generator (PQRST complex)
    function ecgWaveform(t: number): number {
      // Normalize t to [0, 1] for one heartbeat cycle
      const p = t % 1;
      
      // P wave
      if (p < 0.1) return 0.15 * Math.sin(p / 0.1 * Math.PI);
      // PR segment
      if (p < 0.15) return 0;
      // Q wave
      if (p < 0.18) return -0.1 * Math.sin((p - 0.15) / 0.03 * Math.PI);
      // R wave (tall spike)
      if (p < 0.23) return 0.9 * Math.sin((p - 0.18) / 0.05 * Math.PI);
      // S wave
      if (p < 0.28) return -0.2 * Math.sin((p - 0.23) / 0.05 * Math.PI);
      // ST segment
      if (p < 0.35) return 0;
      // T wave
      if (p < 0.5) return 0.25 * Math.sin((p - 0.35) / 0.15 * Math.PI);
      // Baseline
      return 0;
    }

    function drawFrame() {
      if (!ctx || !canvas) return;
      
      frameRef.current += 1;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(7, 27, 52, 1)'; // Deep navy background
      ctx.fillRect(0, 0, width, height);

      // ─── Subtle grid lines ─────────────────────────
      ctx.strokeStyle = 'rgba(0, 183, 168, 0.05)';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ─── Update cycle phase ────────────────────────
      const cycleSpeed = 0.003;
      cyclePhase += cycleSpeed;
      if (cyclePhase > 4) cyclePhase = 0;

      // ─── Draw ECG waveform ─────────────────────────
      ecgPhase += 0.015;
      const ecgY = height * 0.55;
      const ecgStartX = 20;
      const ecgEndX = width - 20;
      const ecgWidth = ecgEndX - ecgStartX;
      
      // Calculate ECG alpha based on cycle phase
      let ecgAlpha = 1;
      if (cyclePhase > 1 && cyclePhase < 2) ecgAlpha = 1 - (cyclePhase - 1);
      if (cyclePhase > 3) ecgAlpha = cyclePhase - 3;
      if (cyclePhase > 1 && cyclePhase < 3) ecgAlpha = Math.max(0, 1 - Math.abs(cyclePhase - 2));
      
      if (ecgAlpha > 0) {
        // Glow effect — draw multiple passes
        for (let pass = 0; pass < 3; pass++) {
          const glowSize = [6, 3, 1][pass];
          const glowAlpha = [0.1, 0.3, 0.9][pass];
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 183, 168, ${glowAlpha * ecgAlpha})`;
          ctx.lineWidth = glowSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          for (let i = 0; i < ECG_POINTS; i++) {
            const t = i / ECG_POINTS;
            const x = ecgStartX + t * ecgWidth;
            const ecgT = t + ecgPhase;
            const y = ecgY - ecgWaveform(ecgT) * 80;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        
        // Bright core line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(79, 209, 197, ${ecgAlpha})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < ECG_POINTS; i++) {
          const t = i / ECG_POINTS;
          const x = ecgStartX + t * ecgWidth;
          const ecgT = t + ecgPhase;
          const y = ecgY - ecgWaveform(ecgT) * 80;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Moving dot on ECG
        const dotT = ((ecgPhase * 10) % ECG_POINTS) / ECG_POINTS;
        const dotX = ecgStartX + dotT * ecgWidth;
        const dotY = ecgY - ecgWaveform(dotT + ecgPhase) * 80;
        
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 209, 197, ${ecgAlpha})`;
        ctx.fill();
        
        // Dot glow
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 209, 197, ${0.3 * ecgAlpha})`;
        ctx.fill();
      }

      // ─── Draw Stethoscope ──────────────────────────
      let stethAlpha = 0;
      if (cyclePhase > 1 && cyclePhase < 3) {
        stethAlpha = cyclePhase < 2 ? (cyclePhase - 1) : (3 - cyclePhase);
      }
      
      stethoscopeProgress = Math.min(1, stethAlpha * 1.5);

      if (stethoscopeProgress > 0) {
        ctx.save();
        ctx.globalAlpha = stethAlpha;
        
        const cx = width / 2;
        const cy = height * 0.4;
        
        // Stethoscope earpieces (top)
        const earLeft = { x: cx - 40, y: cy - 80 };
        const earRight = { x: cx + 40, y: cy - 80 };
        
        // Stethoscope tubing paths
        const tubeLeftCP1 = { x: cx - 35, y: cy - 30 };
        const tubeLeftCP2 = { x: cx - 20, y: cy + 20 };
        const tubeRightCP1 = { x: cx + 35, y: cy - 30 };
        const tubeRightCP2 = { x: cx + 20, y: cy + 20 };
        
        // Chest piece (bottom circle)
        const chestPiece = { x: cx, y: cy + 60 };
        
        // Draw stethoscope with neon glow
        for (let pass = 0; pass < 3; pass++) {
          const glowSize = [8, 4, 2][pass];
          const glowAlpha2 = [0.1, 0.4, 1][pass];
          
          ctx.strokeStyle = `rgba(79, 209, 197, ${glowAlpha2})`;
          ctx.lineWidth = glowSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Left earpiece
          ctx.beginPath();
          ctx.arc(earLeft.x - 8, earLeft.y, 8, 0, Math.PI * 2);
          ctx.stroke();
          
          // Right earpiece
          ctx.beginPath();
          ctx.arc(earRight.x + 8, earRight.y, 8, 0, Math.PI * 2);
          ctx.stroke();
          
          // Left tube
          ctx.beginPath();
          ctx.moveTo(earLeft.x, earLeft.y);
          ctx.bezierCurveTo(
            tubeLeftCP1.x, tubeLeftCP1.y,
            tubeLeftCP2.x, tubeLeftCP2.y,
            chestPiece.x - 5, chestPiece.y - 15
          );
          ctx.stroke();
          
          // Right tube
          ctx.beginPath();
          ctx.moveTo(earRight.x, earRight.y);
          ctx.bezierCurveTo(
            tubeRightCP1.x, tubeRightCP1.y,
            tubeRightCP2.x, tubeRightCP2.y,
            chestPiece.x + 5, chestPiece.y - 15
          );
          ctx.stroke();
          
          // Chest piece (circle)
          ctx.beginPath();
          ctx.arc(chestPiece.x, chestPiece.y, 20, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner circle of chest piece
          if (pass === 2) {
            ctx.beginPath();
            ctx.arc(chestPiece.x, chestPiece.y, 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 183, 168, 0.6)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        
        // Pulsing glow on chest piece
        const pulseScale = 1 + 0.1 * Math.sin(frameRef.current * 0.05);
        ctx.beginPath();
        ctx.arc(chestPiece.x, chestPiece.y, 25 * pulseScale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 183, 168, ${0.2 + 0.1 * Math.sin(frameRef.current * 0.05)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }

      // ─── Particles ─────────────────────────────────
      const particleCount = 15;
      for (let i = 0; i < particleCount; i++) {
        const px = (Math.sin(frameRef.current * 0.01 + i * 1.7) * 0.5 + 0.5) * width;
        const py = (Math.cos(frameRef.current * 0.008 + i * 2.3) * 0.5 + 0.5) * height;
        const size = 1 + Math.sin(frameRef.current * 0.02 + i) * 0.5;
        
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 183, 168, ${0.1 + Math.sin(frameRef.current * 0.01 + i) * 0.05})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    }

    drawFrame();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`max-w-full ${className}`}
      style={{ 
        imageRendering: 'auto',
        borderRadius: '1rem',
      }}
    />
  );
}
