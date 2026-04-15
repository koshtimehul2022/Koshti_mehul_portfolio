import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { Snowflake, Flame, CloudRain, Sun, Palette, Zap, Waves } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const themeIcons: Record<Theme, React.ReactNode> = {
  basic: <Palette className="w-4 h-4" />,
  snow: <Snowflake className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  rain: <CloudRain className="w-4 h-4" />,
  desert: <Sun className="w-4 h-4" />,
  electro: <Zap className="w-4 h-4" />,
  ocean: <Waves className="w-4 h-4" />,
};

const themeLabels: Record<Theme, string> = {
  basic: 'Noir',
  snow: 'Arctic',
  fire: 'Inferno',
  rain: 'Storm',
  desert: 'Sahara',
  electro: 'Electric',
  ocean: 'Marine',
};

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    setIsOpen(false);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  return (
    <motion.div
      className="fixed top-4 left-4 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2 }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        data-cursor-hover
        className="p-2.5 sm:p-3 rounded-full glass hover:bg-secondary transition-colors"
        aria-label="Change theme"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
      >
        <motion.div key={theme} initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20 }}>
          {themeIcons[theme]}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute top-full mt-3 left-0 glass rounded-xl p-2 min-w-[160px] z-50"
              style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)' }}
            >
              <p className="text-xs text-muted-foreground px-3 py-1 mb-1">Select Theme</p>
              {themes.map((t, index) => (
                <motion.button
                  key={t}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleThemeChange(t)}
                  data-cursor-hover
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === t ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {themeIcons[t]}
                  <span className="capitalize">{themeLabels[t]}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ThemeSwitcher;
