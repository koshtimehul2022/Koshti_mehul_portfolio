import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';
import { User } from 'lucide-react';
import mehulprofile from '@/assets/Mehul - Profile.png';
import typingKeySound from '@/assets/keyboard-typing-sound-effect-335503.mp3';

const TypingText = ({ text, delay = 0, isInView }: { text: string; delay?: number; isInView: boolean }) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const interactionHandlerRef = useRef<(() => void) | null>(null);

  const cleanupInteraction = () => {
    if (interactionHandlerRef.current) {
      window.removeEventListener('pointerdown', interactionHandlerRef.current);
      window.removeEventListener('keydown', interactionHandlerRef.current);
      window.removeEventListener('touchstart', interactionHandlerRef.current);
      interactionHandlerRef.current = null;
    }
  };

  const tryPlayAudio = async () => {
    if (!audioRef.current || document.documentElement.getAttribute('data-sound-muted') === 'true') return;
    try {
      await audioRef.current.play();
    } catch {
      if (!interactionHandlerRef.current) {
        interactionHandlerRef.current = () => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          cleanupInteraction();
        };
        window.addEventListener('pointerdown', interactionHandlerRef.current, { once: true });
        window.addEventListener('keydown', interactionHandlerRef.current, { once: true });
        window.addEventListener('touchstart', interactionHandlerRef.current, { once: true });
      }
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(typingKeySound);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.18;
    audioRef.current.preload = 'auto';
    audioRef.current.setAttribute('playsinline', '');

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      cleanupInteraction();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const cleanupTyping = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      cleanupInteraction();
    };

    if (!isInView) {
      cleanupTyping();
      setStarted(false);
      setDisplayText('');
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setStarted(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        tryPlayAudio();
      }

      let i = 0;
      intervalRef.current = window.setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          cleanupInteraction();
        }
      }, 18);
    }, delay);

    return cleanupTyping;
  }, [isInView, text, delay]);

  if (!started) return <span className="opacity-0">{text}</span>;
  return <>{displayText}<span className="animate-pulse text-primary">|</span></>;
};

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { settings: siteSettings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const { data: files } = await supabase.storage
          .from('portfolio-media')
          .list('profile', { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });
        if (files && files.length > 0) {
          const { data: urlData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(`profile/${files[0].name}`);
          if (urlData?.publicUrl) {
            setProfileImage(urlData.publicUrl);
          }
        }
      } catch {
        // Silently fail, show defaults
      }
    };
    loadProfileImage();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen flex items-center py-32 relative"
    >
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-primary text-sm font-medium tracking-widest uppercase"
            >
              About Me
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-display mt-4 mb-8"
            >
              Building the
              <br />
              <span className="text-gradient">Future of Web</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body-lg mb-6"
            >
              <TypingText
                text="I'm a Creative Developer, Accountant with 7+ years of experience, Digital Agency Owner, and BI Executive — combining technology, data, and finance to craft smart, scalable, and impactful digital solutions."
                delay={600}
                isInView={isInView}
              />
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-body-lg mb-12"
            >
              <TypingText
                text="From developing modern web applications to managing financial operations and leading a digital agency — I deliver a complete, results-driven approach where every project turns into impactful execution."
                delay={2600}
                isInView={isInView}
              />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8"
            >
              {[
              { value: settingsLoading ? '...' : `${siteSettings?.years_accounting ?? 7}+`, label: 'Years in Accounting' },
              { value: settingsLoading ? '...' : `${siteSettings?.projects_delivered ?? 120}+`, label: 'Projects Delivered' },
              { value: settingsLoading ? '...' : `${siteSettings?.happy_clients ?? 50}+`, label: 'Happy Clients' },
              { value: settingsLoading ? '...' : `${siteSettings?.years_development ?? 3}+`, label: 'Years in Development' },
            ].map((stat, index) => (
                <div key={stat.label}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-primary block"
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-sm text-muted-foreground mt-1 block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3, type: 'spring', damping: 15 }}
            className="relative aspect-square"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl"
              initial={{ x: 60, y: -40, opacity: 0 }}
              animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, type: 'spring' }}
            />
            <motion.div
              className="absolute inset-4 border border-primary/20 rounded-2xl"
              initial={{ x: -40, y: 30, opacity: 0 }}
              animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.7, type: 'spring' }}
            />
            <motion.div
              className="absolute inset-8 bg-black rounded-xl overflow-hidden"
              initial={{ x: 30, y: 50, opacity: 0 }}
              animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.9, type: 'spring' }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <img
                  src={profileImage || mehulprofile}
                  alt="Mehul Koshti"
                  className="w-full h-full object-contain transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-sm text-muted-foreground">Philosophy</p>
                <p className="text-xl font-medium mt-2">
                  "Design is not just what it looks like. Design is how it works."
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
