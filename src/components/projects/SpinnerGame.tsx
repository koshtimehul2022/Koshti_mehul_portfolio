import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Confetti from 'react-confetti';

interface SpinnerGameProps {
  onClose: () => void;
}

const SpinnerGame = ({ onClose }: SpinnerGameProps) => {
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [newOption, setNewOption] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const colors = [
    'hsl(var(--primary))', 'hsl(var(--accent))',
    'hsl(280, 80%, 60%)', 'hsl(160, 80%, 50%)',
    'hsl(340, 80%, 60%)', 'hsl(200, 80%, 55%)',
    'hsl(30, 90%, 55%)', 'hsl(120, 70%, 45%)',
  ];

  const segmentAngle = 360 / options.length;

  const addOption = () => {
    if (newOption.trim() && options.length < 8) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const calculateWinner = (rotationValue: number) => {
    const finalAngle = ((rotationValue % 360) + 360) % 360;
    const segmentAngle = 360 / options.length;
    const adjustedAngle = (360 - finalAngle + segmentAngle / 2) % 360;
    const index = Math.floor(adjustedAngle / segmentAngle);
    return options[index];
  };

  const spin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setResult(null);

    const fullSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const extraRotation = Math.random() * 360;
    const totalRotation = rotation + fullSpins + extraRotation;

    setRotation(totalRotation);
  };

  const reset = () => {
    setRotation(0);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-auto"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Projects
        </motion.button>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          Custom <span className="text-gradient">Spinner</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground mb-8">
          Add your options and let fate decide!
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Options Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold mb-4">Your Options ({options.length}/8)</h3>
            <div className="flex gap-2 mb-4">
              <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="Add an option..." onKeyPress={(e) => e.key === 'Enter' && addOption()} className="bg-card" maxLength={30} />
              <Button onClick={addOption} disabled={options.length >= 8 || !newOption.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3 p-3 bg-card rounded-lg group">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="flex-grow truncate">{option}</span>
                  <button onClick={() => removeOption(index)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all" disabled={options.length <= 2}>
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Spinner */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
            <div className="relative">
              {/* Pointer at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-primary" />
              </div>

              {/* Wheel */}
              <motion.div
                animate={{ rotate: rotation + segmentAngle / 2 }}
                transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
                onAnimationComplete={() => {
                  if (isSpinning) {
                    const winner = calculateWinner(rotation);
                    setResult(winner);
                    setIsSpinning(false);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                  }
                }}
                className="relative w-72 h-72 rounded-full overflow-hidden shadow-2xl"
                style={{
                  background: `conic-gradient(${options.map((_, i) =>
                    `${colors[i % colors.length]} ${(i / options.length) * 100}% ${((i + 1) / options.length) * 100}%`
                  ).join(', ')})`,
                }}
              >
                {options.map((option, index) => {
                  const angle = (index / options.length) * 360 + 360 / options.length / 2;
                  return (
                    <div key={index} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${angle}deg)` }}>
                      <span className="absolute text-xs font-bold text-white drop-shadow-lg truncate max-w-[90px] text-center" style={{ transform: `translateX(70px) rotate(${-angle}deg)` }}>
                        {option}
                      </span>
                    </div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background shadow-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button onClick={spin} disabled={isSpinning || options.length < 2} size="lg" className="gap-2">
                <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'Spinning...' : 'Spin!'}
              </Button>
              <Button onClick={reset} variant="outline" disabled={isSpinning}>Reset</Button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="mt-8 p-6 bg-card rounded-2xl text-center">
                  <div className="text-sm text-muted-foreground mb-2">Winner:</div>
                  <div className="text-2xl font-bold text-primary">{result}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpinnerGame;
