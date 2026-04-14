import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, Trophy, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';

interface ClickCounterGameProps {
  onClose: () => void;
}

const ClickCounterGame = ({ onClose }: ClickCounterGameProps) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('clickCounterBest');
    return saved ? parseInt(saved) : 0;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const clicksRef = useRef(0);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      const finalClicks = clicksRef.current;
      setClicks(finalClicks);
      setGameState('finished');
      if (finalClicks > bestScore) {
        setBestScore(finalClicks);
        localStorage.setItem('clickCounterBest', finalClicks.toString());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [gameState, timeLeft, bestScore]);

  const startGame = () => {
    setGameState('playing');
    setClicks(0);
    clicksRef.current = 0;
    setTimeLeft(10);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (gameState !== 'playing') return;

    const newClicks = clicksRef.current + 1;
    clicksRef.current = newClicks;
    setClicks(newClicks);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now() + Math.random();
    setClickEffects(prev => [...prev, { id, x, y }]);
    setTimeout(() => setClickEffects(prev => prev.filter(effect => effect.id !== id)), 500);
  };

  const resetGame = () => {
    setGameState('idle');
    setClicks(0);
    clicksRef.current = 0;
    setTimeLeft(10);
  };

  const isNewRecord = gameState === 'finished' && clicks > 0 && clicks >= bestScore;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Projects
        </motion.button>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4 text-center">
          Click <span className="text-gradient">Counter</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground mb-12 text-center">
          Click as fast as you can in 10 seconds!
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-6 py-3 bg-card rounded-full">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Best Score:</span>
            <span className="font-bold text-primary">{bestScore}</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <Button onClick={startGame} size="lg" className="gap-2 text-lg px-8 py-6">
                <Play className="w-5 h-5" /> Start Game
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
              <motion.div key={timeLeft} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-6xl font-bold text-primary mb-8">
                {timeLeft}
              </motion.div>
              <button onClick={handleClick} className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-accent transition-transform active:scale-95 overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MousePointerClick className="w-16 h-16 text-primary-foreground mb-2" />
                  <span className="text-5xl font-bold text-primary-foreground">{clicks}</span>
                </div>
                {clickEffects.map(effect => (
                  <motion.div key={effect.id} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} className="absolute w-12 h-12 rounded-full bg-white/30 pointer-events-none" style={{ left: effect.x - 24, top: effect.y - 24 }} />
                ))}
              </button>
              <p className="text-muted-foreground mt-8">TAP! TAP! TAP!</p>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Trophy className="w-16 h-16 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">{isNewRecord ? '🎉 New Record!' : "Time's Up!"}</h2>
              <div className="text-6xl font-bold text-primary mb-2">{clicks}</div>
              <div className="text-muted-foreground mb-8">clicks in 10 seconds</div>
              <div className="text-lg mb-8">
                That's <span className="text-primary font-bold">{(clicks / 10).toFixed(1)}</span> clicks per second!
              </div>
              <Button onClick={resetGame} size="lg" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ClickCounterGame;
