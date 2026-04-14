import { useEffect, useRef, useCallback } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const clicking = useRef(false);
  const visible = useRef(false);
  const rafId = useRef(0);

  const render = useCallback(() => {
    dotPos.current.x += (pos.current.x - dotPos.current.x) * 0.35;
    dotPos.current.y += (pos.current.y - dotPos.current.y) * 0.35;
    ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;

    if (dotRef.current) {
      const scale = clicking.current ? 0.6 : hovering.current ? 1.8 : 1;
      dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (visible.current) dotRef.current.style.opacity = '1';
    }
    if (ringRef.current) {
      const scale = hovering.current ? 1.5 : 1;
      const opacity = hovering.current ? 0.5 : 0.3;
      ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      ringRef.current.style.opacity = visible.current ? String(opacity) : '0';
    }

    rafId.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    // Check for touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    
    rafId.current = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!visible.current) visible.current = true;
    };
    const onDown = () => { clicking.current = true; };
    const onUp = () => { clicking.current = false; };
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [data-cursor-hover], input, textarea, select, label')) {
        hovering.current = true;
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [data-cursor-hover], input, textarea, select, label')) {
        hovering.current = false;
      }
    };
    const onLeave = () => {
      visible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const onEnter = () => { visible.current = true; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [render]);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference"
        style={{ willChange: 'transform', opacity: 0 }}
      >
        <div
          className="w-4 h-4 rounded-full bg-foreground"
          style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
        />
      </div>
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ willChange: 'transform, opacity', opacity: 0 }}
      >
        <div className="w-10 h-10 rounded-full border border-foreground/30" />
      </div>
    </>
  );
};

export default CustomCursor;
