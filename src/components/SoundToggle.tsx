import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { stopAllSounds } from '@/lib/soundManager';

const SoundToggle = () => {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const initial = document.documentElement.getAttribute('data-sound-muted') === 'true';
    setMuted(initial);
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    document.documentElement.setAttribute('data-sound-muted', String(next));
    if (next) {
      stopAllSounds();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3, duration: 0.5 }}
      onClick={toggle}
      className="fixed top-6 right-20 z-[100] flex items-center gap-2 px-3 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border/30 text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all duration-300 text-xs"
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      <span className="hidden sm:inline">{muted ? 'Muted' : 'Sound'}</span>
    </motion.button>
  );
};

export default SoundToggle;
