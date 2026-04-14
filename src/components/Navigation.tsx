import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Home, User, Image, Briefcase, FileText, Wrench, Mail } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: Section[] = [
  { id: 'hero', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'about', label: 'About', icon: <User className="w-4 h-4" /> },
  { id: 'portfolio', label: 'Portfolio', icon: <Image className="w-4 h-4" /> },
  { id: 'work', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'resume', label: 'Resume', icon: <FileText className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', icon: <Wrench className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
];

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('hero');

  const handleScroll = useCallback(() => {
    const windowHeight = window.innerHeight;
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
          setActiveSection(id);
        }
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 1.8 }}
      className="fixed bottom-4 z-[100] left-0 right-0 flex justify-center px-4"
    >
      <div
        className="glass rounded-full px-2 py-1.5 sm:py-2 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 max-w-[calc(100vw-2rem)]"
        style={{ boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3), 0 4px 20px hsl(var(--primary) / 0.15), 0 8px 40px rgba(0, 0, 0, 0.2)' }}
      >
        {sections.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            data-cursor-hover
            title={label}
            className={`relative px-2.5 sm:px-3 md:px-5 py-2 text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-300 rounded-full whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-1.5 ${
              activeSection === id
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeSection === id && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <span className="relative z-10 md:hidden">{icon}</span>
            <span className="relative z-10 hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;
