import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeHint = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (show) {
      const hide = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(hide);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-7 left-[70px] z-[101] glass rounded-full px-4 py-2 text-xs text-foreground whitespace-nowrap"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
        >
          Try a new theme ✨
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeHint;
