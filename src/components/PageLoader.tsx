import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TextScramble = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iteration = 0;
      const totalIterations = text.length * 3;
      
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration / 3) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iteration++;

        if (iteration >= totalIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsComplete(true);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={isComplete ? 'text-gradient' : ''}>
      {displayText || text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('')}
    </span>
  );
};

interface PageLoaderProps {
  onComplete: () => void;
}

const PageLoader = ({ onComplete }: PageLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 40 && phase === 'logo') {
      setPhase('text');
    }
    if (progress >= 100) {
      setTimeout(() => setPhase('exit'), 500);
      setTimeout(onComplete, 1500);
    }
  }, [progress, phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12"
          >
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: 'blur(20px)' }}
              />
              <motion.div
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-4xl font-bold text-primary-foreground">M</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Scramble */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              <TextScramble text="MEHUL KOSHTI" delay={600} />
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-muted-foreground text-sm md:text-base max-w-md mx-auto px-4"
            >
              <TextScramble 
                text="A creative mind who experiments, builds, and is always ready for every kind of work." 
                delay={1200} 
              />
            </motion.p>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '200px' }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-12 h-[2px] bg-muted rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>

          {/* Loading Text */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-muted-foreground tracking-widest uppercase"
          >
            Loading Experience
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default PageLoader;
