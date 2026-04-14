import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowUp, ArrowDown, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Confetti from 'react-confetti';

interface NumberGuessingGameProps {
  onClose: () => void;
}

const NumberGuessingGame = ({ onClose }: NumberGuessingGameProps) => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<Array<{ value: number; hint: 'high' | 'low' | 'correct' }>>([]);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const range = { min: 1, max: 10 };

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetNumber(Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
    setGuess('');
    setAttempts([]);
    setGameState('playing');
    setShowConfetti(false);
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < range.min || guessNum > range.max) return;

    let hint: 'high' | 'low' | 'correct' = 'correct';
    if (guessNum > targetNumber) hint = 'high';
    else if (guessNum < targetNumber) hint = 'low';

    setAttempts([...attempts, { value: guessNum, hint }]);
    setGuess('');

    if (guessNum === targetNumber) {
      setGameState('won');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const getHintColor = (hint: string) => {
    switch (hint) {
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      case 'correct': return 'text-green-400 bg-green-400/10';
      default: return '';
    }
  };

  const getHintIcon = (hint: string) => {
    switch (hint) {
      case 'high': return <ArrowDown className="w-4 h-4" />;
      case 'low': return <ArrowUp className="w-4 h-4" />;
      case 'correct': return <Check className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-auto"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-6 py-20 max-w-2xl">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Projects
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        >
          Number <span className="text-gradient">Guessing</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-8 text-center"
        >
          I'm thinking of a number between {range.min} and {range.max}...
        </motion.p>

        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Target className="w-12 h-12 text-primary" />
              </motion.div>

              <div className="flex gap-3 max-w-xs mx-auto mb-8">
                <Input
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={`${range.min} - ${range.max}`}
                  min={range.min}
                  max={range.max}
                  onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                  className="bg-card text-center text-xl"
                />
                <Button onClick={handleGuess} disabled={!guess}>
                  Guess
                </Button>
              </div>

              {attempts.length > 0 && (
                <div className="space-y-3 max-w-sm mx-auto">
                  <div className="text-sm text-muted-foreground text-center mb-4">
                    Attempts: {attempts.length}
                  </div>
                  {attempts.map((attempt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${getHintColor(attempt.hint)}`}
                    >
                      <span className="text-2xl font-bold">{attempt.value}</span>
                      <div className="flex items-center gap-2">
                        {getHintIcon(attempt.hint)}
                        <span className="capitalize">{attempt.hint === 'high' ? 'Too High' : attempt.hint === 'low' ? 'Too Low' : 'Correct!'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="won"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-32 h-32 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Sparkles className="w-16 h-16 text-green-500" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">🎉 You Got It!</h2>
              <div className="text-6xl font-bold text-primary mb-4">{targetNumber}</div>
              <p className="text-muted-foreground mb-8">
                You found it in <span className="text-primary font-bold">{attempts.length}</span> {attempts.length === 1 ? 'try' : 'tries'}!
              </p>

              <Button onClick={startNewGame} size="lg" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NumberGuessingGame;
