import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const RippleEffect = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only trigger on interactive elements
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-cursor-hover]') ||
        target.closest('[role="button"]')
      ) {
        const id = Date.now() + Math.random();
        setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 800);
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute w-12 h-12 rounded-full border-2 border-primary/40"
            style={{
              left: ripple.x - 24,
              top: ripple.y - 24,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RippleEffect;
