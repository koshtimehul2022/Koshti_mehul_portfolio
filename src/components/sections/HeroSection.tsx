import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '@/components/MagneticButton';

const TextScramble = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStarted(true);
      let iteration = 0;
      
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration / 2) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iteration++;

        if (iteration >= text.length * 2) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, 40);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  if (!started) return <span className="opacity-0">{text}</span>;
  return <>{displayText}</>;
};

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 text-center px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-hero-sub mb-4"
        >
          <TextScramble text="Developer • Accountant • Digital Agency Owner" delay={1800} />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="text-hero"
        >
          <span className="block">
            <TextScramble text="MEHUL" delay={2000} />
          </span>
          <span className="block text-gradient">
            <TextScramble text="KOSHTI" delay={2200} />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="text-body-lg mt-8 max-w-2xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 1.2 }}
            className="inline-block"
          >
            Creative Developer, Accountant (7+ years), Digital Agency Owner & BI Executive — building and delivering impactful solutions.
          </motion.span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8 }}
          className="mt-12 flex items-center justify-center gap-6"
        >
          <MagneticButton
            href="#work"
            strength={0.4}
            scrambleOnHover
            className="group relative px-8 py-4 overflow-hidden rounded-full bg-primary text-primary-foreground font-medium transition-transform hover:scale-105"
          >
            Explore Work
          </MagneticButton>
          <MagneticButton
            href="#contact"
            strength={0.4}
            scrambleOnHover
            className="px-8 py-4 rounded-full border border-foreground/30 font-medium hover:bg-foreground/5 transition-colors"
          >
            Get in Touch
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border border-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-40 left-20 w-px h-60 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-1/3 left-10 w-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
};

export default HeroSection;
