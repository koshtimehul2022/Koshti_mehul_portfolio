import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';

interface BallClickGameProps {
  onClose: () => void;
}

const BallClickGame = ({ onClose }: BallClickGameProps) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballSize, setBallSize] = useState(60);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('ballClickBest');
    return saved ? parseInt(saved) : 0;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [hitEffects, setHitEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const scoreRef = useRef(0);

  const getRandomPosition = useCallback(() => {
    const padding = ballSize + 20;
    return {
      x: Math.random() * (100 - (padding / 5)) + (padding / 10),
      y: Math.random() * (100 - (padding / 5)) + (padding / 10),
    };
  }, [ballSize]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      const finalScore = scoreRef.current;
      setGameState('finished');
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('ballClickBest', finalScore.toString());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [gameState, timeLeft, bestScore]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setBallSize(60);
    setBallPosition(getRandomPosition());
  };

  // Click on ball = score + move
  const handleBallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState !== 'playing') return;

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / (e.currentTarget.parentElement?.getBoundingClientRect().width || 1)) * 100;
    const y = ((rect.top + rect.height / 2 - (e.currentTarget.parentElement?.getBoundingClientRect().top || 0)) / (e.currentTarget.parentElement?.getBoundingClientRect().height || 1)) * 100;

    const id = Date.now();
    setHitEffects(prev => [...prev, { id, x, y }]);
    setTimeout(() => setHitEffects(prev => prev.filter(effect => effect.id !== id)), 500);

    const newSize = Math.max(30, 60 - Math.floor(newScore / 5) * 5);
    setBallSize(newSize);
    setBallPosition(getRandomPosition());
  };

  // Click on empty area = just move ball (no score)
  const handleAreaClick = () => {
    if (gameState !== 'playing') return;
    setBallPosition(getRandomPosition());
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setBallSize(60);
  };

  const isNewRecord = gameState === 'finished' && score >= bestScore && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-hidden"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-6 py-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold">
            Ball <span className="text-gradient">Click</span>
          </motion.h1>
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Projects
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-8 mb-4">
          <div className="text-center px-6 py-3 bg-card rounded-xl">
            <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="text-center px-6 py-3 bg-card rounded-xl">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="text-center px-6 py-3 bg-card rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <div className="text-2xl font-bold text-primary">{bestScore}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-grow rounded-2xl bg-card relative overflow-hidden">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center">
                <Target className="w-24 h-24 text-primary/30 mb-8" />
                <h2 className="text-2xl font-bold mb-4">Click the balls!</h2>
                <p className="text-muted-foreground mb-8">You have 30 seconds. Click elsewhere and the ball moves!</p>
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Start Game
                </Button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={handleAreaClick}>
                <motion.div
                  key={`${ballPosition.x}-${ballPosition.y}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className="absolute rounded-full bg-gradient-to-br from-primary to-accent cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    width: ballSize,
                    height: ballSize,
                    left: `${ballPosition.x}%`,
                    top: `${ballPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={handleBallClick}
                />

                {hitEffects.map(effect => (
                  <motion.div
                    key={effect.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    className="absolute pointer-events-none"
                    style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-primary" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Trophy className="w-12 h-12 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">{isNewRecord ? '🎉 New Record!' : 'Game Over!'}</h2>
                <div className="text-6xl font-bold text-primary mb-2">{score}</div>
                <div className="text-muted-foreground mb-8">balls clicked</div>
                <Button onClick={resetGame} size="lg" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BallClickGame;
