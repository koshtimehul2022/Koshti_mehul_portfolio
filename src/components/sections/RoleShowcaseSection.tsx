import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MehulImage from '@/assets/Mehul.png';
import ArtistMehulImage from '@/assets/Artist-Mehul.png';
import DigitalAgencyOwnerImage from '@/assets/Digital Aency Owner - Mehul.png';
import creativeparthnerImage from '@/assets/Creative Partner - Mehul.png';
import mehul2Image from '@/assets/Mehul-2.png';
import AccountantImage from '@/assets/Accountant - mehul.png';


const roles = [
  { title: "Full Stack Developer", desc: "Building powerful web apps with clean code & modern tech." },
  { title: "Content Creator", desc: "Creating content that connects, engages & grows audiences." },
  { title: "Sketch Artist", desc: "Bringing ideas to life through detailed hand-drawn artwork." },
  { title: "Accountant", desc: "Accurate financial and whole System management with a creative mindset." },
  { title: "Digital Marketing Agency Owner", desc: "Running a full-service digital agency for modern brands." },
  { title: "Social Media Manager", desc: "Managing brands across platforms with strategy & creativity." },
  { title: "Creative Developer", desc: "Where design meets development — pixel-perfect & interactive." },
  { title: "Reels & Video Editor", desc: "Crafting cinematic reels that stop the scroll." },
  { title: "Your Creative Partner", desc: "Let's build something amazing together." },
];

const AUTO_INTERVAL = 6000;

const roleImages: Record<string, string> = {
  'Sketch Artist': ArtistMehulImage,
  'Accountant': AccountantImage,
  'Digital Marketing Agency Owner': DigitalAgencyOwnerImage,
  'Your Creative Partner': creativeparthnerImage,
  // 'Creative Developer': mehul2Image,
  'Reels & Video Editor': mehul2Image,
  'Content Creator': mehul2Image,
  'Social Media Manager': mehul2Image,
  // 'Full Stack Developer': mehul2Image,
};

const RoleShowcaseSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/page-flip-01a.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const playSound = useCallback(() => {
    const isMuted = document.documentElement.getAttribute('data-sound-muted') === 'true';
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + roles.length) % roles.length);
    playSound();
  };

  // Auto-rotation
  useEffect(() => {
    if (!isVisible) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % roles.length);
      playSound();
    }, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, playSound]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % roles.length);
      playSound();
    }, AUTO_INTERVAL);
  };

  const handleNav = (dir: number) => {
    navigate(dir);
    resetTimer();
  };

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      filter: 'blur(8px)',
    }),
  };

  return (
    <section
      ref={sectionRef}
      id="roles"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[200px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8"
          >
            {/* Left: Title */}
            <div className="flex-1 text-center lg:text-right order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient leading-tight">
                {roles[activeIndex].title}
              </h2>
            </div>

            {/* Center: Personal image */}
            <div className="relative order-1 lg:order-2 flex-shrink-0">
              <motion.div
                initial={{ scale: 0.96, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent blur-3xl opacity-70" />
                <div className="relative w-60 h-72 sm:w-72 sm:h-84 md:w-80 md:h-[28rem] lg:w-[28rem] lg:h-[36rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(99,102,241,0.18)] backdrop-blur-xl">
                  <img
                    src={roleImages[roles[activeIndex].title] ?? MehulImage}
                    alt={`${roles[activeIndex].title} — Mehul Koshti`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/25" />
                </div>
                <div className="absolute inset-x-0 -bottom-8 mx-auto h-24 w-56 rounded-full bg-purple-500/20 blur-[60px]" />
              </motion.div>
            </div>

            {/* Right: Description + CTA */}
            <div className="flex-1 text-center lg:text-left order-3">
              <div className="backdrop-blur-xl bg-card/30 border border-border/20 rounded-2xl p-6 max-w-sm mx-auto lg:mx-0">
                <p className="text-lg text-foreground/80 mb-5">
                  {roles[activeIndex].desc}
                </p>
                <button
                  onClick={scrollToWork}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                >
                  Check Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - far left and far right on desktop, bottom on mobile */}
        <div className="flex items-center justify-center gap-8 mt-8 lg:hidden">
          <ArrowButton direction="left" onClick={() => handleNav(-1)} />
          <span className="text-xs text-muted-foreground tracking-widest">
            {activeIndex + 1} / {roles.length}
          </span>
          <ArrowButton direction="right" onClick={() => handleNav(1)} />
        </div>

        {/* Desktop arrows */}
        <div className="hidden lg:block absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20">
          <ArrowButton direction="left" onClick={() => handleNav(-1)} />
        </div>
        <div className="hidden lg:block absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20">
          <ArrowButton direction="right" onClick={() => handleNav(1)} />
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {roles.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1);
                setActiveIndex(i);
                playSound();
                resetTimer();
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'bg-primary w-6 shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

      </motion.div>
    </section>
  );
};

// ResumeButton removed

const ArrowButton = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative w-12 h-12 rounded-full border border-primary/30 bg-card/30 backdrop-blur-sm flex items-center justify-center text-primary hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group"
  >
    <span className="absolute inset-0 rounded-full animate-[pulse_2s_ease-in-out_infinite] border border-primary/20" />
    <span className="absolute inset-[-4px] rounded-full animate-[pulse_2s_ease-in-out_infinite_0.5s] border border-primary/10" />
    {direction === 'left' ? (
      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    ) : (
      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    )}
  </motion.button>
);

export default RoleShowcaseSection;
