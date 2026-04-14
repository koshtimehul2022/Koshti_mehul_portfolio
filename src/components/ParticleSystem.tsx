import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  depth: number;
  type?: number; // for snow: 0=dot, 1=star, 2=blur
}

const ParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lightningRef = useRef<number>(0);
  const lightningXRef = useRef<number>(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getThemeConfig = () => {
      switch (theme) {
        case 'snow':
          return {
            count: 200,
            color: 'rgba(200, 230, 255, ',
            sizeRange: [1, 6],
            speedYRange: [0.5, 3],
            speedXRange: [-0.5, 0.5],
            direction: 'down' as const,
          };
        case 'fire':
          return {
            count: 120,
            color: 'rgba(255, 120, 50, ',
            sizeRange: [2, 8],
            speedYRange: [1.5, 5],
            speedXRange: [-0.8, 0.8],
            direction: 'up' as const,
          };
        case 'rain':
          return {
            count: 200,
            color: 'rgba(100, 180, 220, ',
            sizeRange: [1, 2],
            speedYRange: [10, 20],
            speedXRange: [-1, 1],
            direction: 'down' as const,
          };
        case 'desert':
          return {
            count: 120,
            color: 'rgba(210, 180, 140, ',
            sizeRange: [1, 4],
            speedYRange: [-0.3, 0.3],
            speedXRange: [1, 4],
            direction: 'horizontal' as const,
          };
        case 'electro':
          return {
            count: 80,
            color: 'rgba(0, 255, 255, ',
            sizeRange: [1, 3],
            speedYRange: [1, 4],
            speedXRange: [-2, 2],
            direction: 'electric' as const,
          };
        case 'ocean':
          return {
            count: 100,
            color: 'rgba(100, 200, 180, ',
            sizeRange: [1, 5],
            speedYRange: [0.1, 0.6],
            speedXRange: [-0.3, 0.3],
            direction: 'float' as const,
          };
        default:
          return {
            count: 40,
            color: 'rgba(180, 120, 255, ',
            sizeRange: [1, 3],
            speedYRange: [0.1, 0.3],
            speedXRange: [-0.1, 0.1],
            direction: 'float' as const,
          };
      }
    };

    const config = getThemeConfig();

    const createParticle = (): Particle => {
      const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
      let x, y;

      if (config.direction === 'horizontal') {
        x = -20;
        y = Math.random() * canvas.height;
      } else if (config.direction === 'up') {
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
      } else {
        x = Math.random() * canvas.width;
        y = -20;
      }

      return {
        x,
        y,
        size,
        speedX: config.speedXRange[0] + Math.random() * (config.speedXRange[1] - config.speedXRange[0]),
        speedY: config.speedYRange[0] + Math.random() * (config.speedYRange[1] - config.speedYRange[0]),
        opacity: 0.3 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        depth: 0.3 + Math.random() * 0.7,
        type: Math.floor(Math.random() * 3),
      };
    };

    particlesRef.current = Array.from({ length: config.count }, createParticle);

    // Spread initial particles across screen
    particlesRef.current.forEach((p) => {
      if (config.direction === 'down') p.y = Math.random() * canvas.height;
      if (config.direction === 'up') p.y = Math.random() * canvas.height;
      if (config.direction === 'horizontal') p.x = Math.random() * canvas.width;
      if (config.direction === 'float' || config.direction === 'electric') {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      }
    });

    // ============ FIRE: tall layered flames ============
    const drawFireBottom = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      // Layer 1: tall base glow reaching ~50% screen height
      const fireH = h * 0.5;
      const gradient = ctx.createLinearGradient(0, h, 0, h - fireH);
      gradient.addColorStop(0, 'rgba(255, 60, 0, 0.45)');
      gradient.addColorStop(0.2, 'rgba(255, 100, 0, 0.3)');
      gradient.addColorStop(0.4, 'rgba(255, 160, 30, 0.15)');
      gradient.addColorStop(0.7, 'rgba(255, 200, 50, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h - fireH, w, fireH);

      // Layer 2: flickering tall flames
      for (let i = 0; i < 30; i++) {
        const fx = (i / 30) * w + Math.sin(time * 0.003 + i) * 40;
        const baseH = 80 + Math.sin(time * 0.005 + i * 0.7) * 60;
        // Occasional burst
        const burst = Math.sin(time * 0.002 + i * 1.3) > 0.85 ? 80 : 0;
        const fh = baseH + burst;
        const fg = ctx.createLinearGradient(fx, h, fx, h - fh);
        fg.addColorStop(0, 'rgba(255, 80, 0, 0.35)');
        fg.addColorStop(0.5, 'rgba(255, 150, 30, 0.15)');
        fg.addColorStop(1, 'rgba(255, 220, 80, 0)');
        ctx.beginPath();
        ctx.moveTo(fx - 20, h);
        ctx.quadraticCurveTo(fx + Math.sin(time * 0.01 + i) * 10, h - fh, fx + 20, h);
        ctx.fillStyle = fg;
        ctx.fill();
      }

      // Layer 3: inner bright flames
      for (let i = 0; i < 15; i++) {
        const fx = (i / 15) * w + Math.cos(time * 0.004 + i * 2) * 20;
        const fh = 40 + Math.sin(time * 0.007 + i) * 30;
        const fg = ctx.createLinearGradient(fx, h, fx, h - fh);
        fg.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
        fg.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.beginPath();
        ctx.moveTo(fx - 8, h);
        ctx.quadraticCurveTo(fx, h - fh, fx + 8, h);
        ctx.fillStyle = fg;
        ctx.fill();
      }
    };

    // ============ STORM: frequent lightning ============
    const drawLightning = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (lightningRef.current <= 0) return;
      lightningRef.current--;

      const alpha = lightningRef.current / 12;
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.06})`;
      ctx.fillRect(0, 0, w, h);

      if (lightningRef.current > 6) {
        const cx = w * lightningXRef.current;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';
        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        let ly = 0;
        let lx = cx;
        while (ly < h * 0.65) {
          lx += (Math.random() - 0.5) * 70;
          ly += 15 + Math.random() * 25;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        // Branch
        if (Math.random() > 0.4) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lx, ly - 60);
          for (let b = 0; b < 4; b++) {
            lx += (Math.random() - 0.3) * 40;
            ly += 10 + Math.random() * 15;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
    };

    // ============ ELECTRO: energy lines flowing to center ============
    const drawElectricEnergy = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const lineCount = 40;

      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const startDist = Math.max(w, h) * 0.8;
        const sx = cx + Math.cos(angle) * startDist;
        const sy = cy + Math.sin(angle) * startDist;

        // Animated progress along line
        const progress = ((time * 0.001 + i * 0.3) % 3) / 3;

        ctx.beginPath();
        const segments = 20;
        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const px = sx + (cx - sx) * t + Math.sin(time * 0.003 + i + s * 0.5) * (20 * (1 - t));
          const py = sy + (cy - sy) * t + Math.cos(time * 0.003 + i + s * 0.5) * (20 * (1 - t));
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.04 + Math.sin(time * 0.002 + i) * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glowing particle traveling along line
        const pt = progress;
        const px = sx + (cx - sx) * pt + Math.sin(time * 0.003 + i + pt * 10) * (20 * (1 - pt));
        const py = sy + (cy - sy) * pt + Math.cos(time * 0.003 + i + pt * 10) * (20 * (1 - pt));
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 6);
        pg.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        pg.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = pg;
        ctx.fillRect(px - 6, py - 6, 12, 12);
      }

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      cg.addColorStop(0, `rgba(0, 255, 255, ${0.15 + Math.sin(time * 0.003) * 0.05})`);
      cg.addColorStop(0.5, 'rgba(0, 200, 255, 0.05)');
      cg.addColorStop(1, 'rgba(0, 100, 255, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();
    };

    // ============ OCEAN: layered water waves ============
    const drawOceanWaves = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      // 6 layered waves
      const layers = [
        { y: h * 0.3, amp: 15, freq: 0.003, speed: 0.001, alpha: 0.04, color: '100, 200, 220' },
        { y: h * 0.4, amp: 20, freq: 0.004, speed: 0.0015, alpha: 0.05, color: '80, 180, 200' },
        { y: h * 0.5, amp: 25, freq: 0.003, speed: 0.002, alpha: 0.06, color: '60, 160, 190' },
        { y: h * 0.6, amp: 18, freq: 0.005, speed: 0.0012, alpha: 0.05, color: '50, 150, 180' },
        { y: h * 0.75, amp: 12, freq: 0.006, speed: 0.0018, alpha: 0.04, color: '40, 130, 170' },
        { y: h * 0.85, amp: 8, freq: 0.007, speed: 0.001, alpha: 0.03, color: '30, 120, 160' },
      ];

      layers.forEach(layer => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = layer.y + Math.sin(x * layer.freq + time * layer.speed) * layer.amp
            + Math.sin(x * layer.freq * 1.5 + time * layer.speed * 0.7) * layer.amp * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(${layer.color}, ${layer.alpha})`;
        ctx.fill();
      });

      // Light refraction ripple overlay
      for (let i = 0; i < 8; i++) {
        const rx = (w * 0.1) + (i / 8) * w * 0.8 + Math.sin(time * 0.001 + i * 1.5) * 40;
        const ry = h * 0.2 + Math.cos(time * 0.0008 + i) * 50;
        const rSize = 60 + Math.sin(time * 0.002 + i) * 20;
        const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, rSize);
        rg.addColorStop(0, `rgba(150, 230, 255, ${0.04 + Math.sin(time * 0.003 + i) * 0.02})`);
        rg.addColorStop(1, 'rgba(100, 200, 220, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ============ DESERT: sand dunes at bottom ============
    const drawDesertDunes = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      // Back dune
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = h - 80 - Math.sin(x * 0.003 + 1) * 40 - Math.sin(x * 0.007) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      const bg = ctx.createLinearGradient(0, h - 120, 0, h);
      bg.addColorStop(0, 'rgba(180, 150, 100, 0.08)');
      bg.addColorStop(1, 'rgba(160, 130, 80, 0.12)');
      ctx.fillStyle = bg;
      ctx.fill();

      // Front dune
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = h - 40 - Math.sin(x * 0.005 + 2.5) * 25 - Math.sin(x * 0.012) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      const fg = ctx.createLinearGradient(0, h - 65, 0, h);
      fg.addColorStop(0, 'rgba(200, 170, 120, 0.1)');
      fg.addColorStop(1, 'rgba(190, 160, 110, 0.15)');
      ctx.fillStyle = fg;
      ctx.fill();

      // Haze
      const haze = ctx.createLinearGradient(0, h * 0.6, 0, h);
      haze.addColorStop(0, 'rgba(210, 180, 140, 0)');
      haze.addColorStop(1, 'rgba(210, 180, 140, 0.07)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);
    };

    const animate = () => {
      const time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Theme-specific background effects
      if (theme === 'fire') drawFireBottom(ctx, canvas.width, canvas.height, time);
      if (theme === 'rain') {
        // Lightning every ~5 seconds
        if (Math.random() < 0.004) {
          lightningRef.current = 14;
          lightningXRef.current = 0.2 + Math.random() * 0.6;
        }
        drawLightning(ctx, canvas.width, canvas.height);
      }
      if (theme === 'electro') drawElectricEnergy(ctx, canvas.width, canvas.height, time);
      if (theme === 'ocean') drawOceanWaves(ctx, canvas.width, canvas.height, time);
      if (theme === 'desert') drawDesertDunes(ctx, canvas.width, canvas.height, time);

      // Snow bottom fog
      if (theme === 'snow') {
        const fog = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
        fog.addColorStop(0, 'rgba(200, 220, 240, 0)');
        fog.addColorStop(1, 'rgba(200, 220, 240, 0.08)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
      }

      particlesRef.current.forEach((particle, index) => {
        const depthFactor = particle.depth;

        if (config.direction === 'up') {
          particle.y -= particle.speedY * depthFactor;
          particle.x += particle.speedX + Math.sin(particle.y * 0.01) * 0.5;
        } else if (config.direction === 'horizontal') {
          particle.x += particle.speedX * depthFactor;
          particle.y += particle.speedY + Math.sin(particle.x * 0.01) * 0.5;
        } else if (config.direction === 'float') {
          particle.y += Math.sin(time * 0.001 + index) * 0.3 * depthFactor;
          particle.x += Math.cos(time * 0.001 + index) * 0.2 * depthFactor;
        } else if (config.direction === 'electric') {
          // Particles drift toward center
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dx = cx - particle.x;
          const dy = cy - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 10) {
            particle.x += (dx / dist) * particle.speedY * depthFactor * 0.5;
            particle.y += (dy / dist) * particle.speedY * depthFactor * 0.5;
          }
          particle.x += Math.sin(time * 0.003 + index) * 1;
          particle.y += Math.cos(time * 0.003 + index) * 1;
          // Reset when close to center
          if (dist < 30) {
            const angle = Math.random() * Math.PI * 2;
            const startDist = Math.max(canvas.width, canvas.height) * 0.6;
            particle.x = cx + Math.cos(angle) * startDist;
            particle.y = cy + Math.sin(angle) * startDist;
          }
        } else {
          // down - snow & rain
          if (theme === 'snow') {
            particle.x += particle.speedX + Math.sin(time * 0.0005 + index * 0.1) * 0.4;
          } else {
            particle.x += particle.speedX;
          }
          particle.y += particle.speedY * depthFactor;
        }

        particle.rotation += particle.rotationSpeed;

        if (
          particle.y > canvas.height + 20 ||
          particle.y < -20 ||
          particle.x > canvas.width + 20 ||
          particle.x < -20
        ) {
          const np = createParticle();
          np.depth = particle.depth;
          np.type = particle.type;
          particlesRef.current[index] = np;
          return;
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity * depthFactor;

        if (theme === 'rain') {
          ctx.beginPath();
          ctx.moveTo(0, -particle.size * 4);
          ctx.lineTo(particle.size / 2, 0);
          ctx.lineTo(-particle.size / 2, 0);
          ctx.closePath();
          ctx.fillStyle = config.color + particle.opacity + ')';
          ctx.fill();
        } else if (theme === 'fire') {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
          gradient.addColorStop(0, 'rgba(255, 200, 100, ' + particle.opacity + ')');
          gradient.addColorStop(0.5, 'rgba(255, 100, 50, ' + particle.opacity * 0.5 + ')');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (theme === 'electro') {
          const sparkGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
          sparkGradient.addColorStop(0, 'rgba(0, 255, 255, ' + particle.opacity + ')');
          sparkGradient.addColorStop(0.3, 'rgba(150, 0, 255, ' + particle.opacity * 0.5 + ')');
          sparkGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = sparkGradient;
          ctx.fill();
        } else if (theme === 'ocean') {
          const bubbleGradient = ctx.createRadialGradient(
            -particle.size * 0.3, -particle.size * 0.3, 0,
            0, 0, particle.size
          );
          bubbleGradient.addColorStop(0, 'rgba(200, 255, 255, ' + particle.opacity * 0.8 + ')');
          bubbleGradient.addColorStop(0.5, 'rgba(100, 200, 180, ' + particle.opacity * 0.4 + ')');
          bubbleGradient.addColorStop(1, 'rgba(50, 150, 150, ' + particle.opacity * 0.1 + ')');
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = bubbleGradient;
          ctx.fill();
          ctx.strokeStyle = 'rgba(200, 255, 255, ' + particle.opacity * 0.3 + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (theme === 'snow') {
          const s = particle.size * depthFactor;
          const pType = particle.type || 0;

          if (pType === 0) {
            // Round dot
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 240, 255, ' + particle.opacity + ')';
            ctx.fill();
          } else if (pType === 1) {
            // Star shape
            ctx.fillStyle = 'rgba(230, 245, 255, ' + particle.opacity + ')';
            ctx.font = `${s * 3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✻', 0, 0);
          } else {
            // Soft blur flake
            const blurG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.5);
            blurG.addColorStop(0, 'rgba(220, 240, 255, ' + particle.opacity * 0.6 + ')');
            blurG.addColorStop(1, 'rgba(220, 240, 255, 0)');
            ctx.beginPath();
            ctx.arc(0, 0, s * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = blurG;
            ctx.fill();
          }
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = config.color + particle.opacity + ')';
          ctx.fill();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: theme === 'basic' ? 0.4 : 0.7 }}
    />
  );
};

export default ParticleSystem;
