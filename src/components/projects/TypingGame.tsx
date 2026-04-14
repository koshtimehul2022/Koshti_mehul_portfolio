import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Confetti from 'react-confetti';

interface TypingGameProps {
  onClose: () => void;
}

const TypingGame = ({ onClose }: TypingGameProps) => {
  const [sourceText, setSourceText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculateStats = useCallback(() => {
    if (!startTime || typedText.length === 0) return;
    const timeInMinutes = elapsedTime / 60000;
    const words = typedText.trim().split(/\s+/).length;
    const calculatedWpm = timeInMinutes > 0 ? Math.round(words / timeInMinutes) : 0;
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === sourceText[i]) correct++;
    }
    const calculatedAccuracy = Math.round((correct / typedText.length) * 100);
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
  }, [startTime, typedText, sourceText, elapsedTime]);

  useEffect(() => {
    if (isPlaying && !isPaused && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isPaused, startTime]);

  useEffect(() => { calculateStats(); }, [typedText, calculateStats]);

  const handleStart = () => {
    if (!sourceText.trim()) return;
    setIsPlaying(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setTypedText('');
    setElapsedTime(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (isPaused && startTime) setStartTime(Date.now() - elapsedTime);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setShowResult(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTypedText('');
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setShowResult(false);
  };

  // Reset game on paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    handleReset();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Projects
        </motion.button>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          Custom <span className="text-gradient">Typing Box</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground mb-8">
          Paste any text, start typing, and measure your speed!
        </motion.p>

        <AnimatePresence mode="wait">
          {!isPlaying && !showResult && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <label className="block text-sm font-medium mb-2">Paste your text here:</label>
              <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter the text you want to practice typing..." className="min-h-[200px] bg-card border-border mb-4" />
              <Button onClick={handleStart} disabled={!sourceText.trim()} className="gap-2">
                <Play className="w-4 h-4" /> Start Typing
              </Button>
            </motion.div>
          )}

          {isPlaying && (
            <motion.div key="typing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-wrap gap-6 mb-6 p-4 bg-card rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{wpm}</div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="p-4 bg-card rounded-xl mb-4 font-mono text-lg leading-relaxed">
                {sourceText.split('').map((char, i) => {
                  let className = 'text-muted-foreground';
                  if (i < typedText.length) {
                    className = typedText[i] === char ? 'text-green-400' : 'text-red-400 bg-red-400/20';
                  } else if (i === typedText.length) {
                    className = 'bg-primary/30 text-foreground';
                  }
                  return <span key={i} className={className}>{char}</span>;
                })}
              </div>

              <Textarea
                ref={inputRef}
                value={typedText}
                onChange={(e) => !isPaused && setTypedText(e.target.value)}
                onPaste={handlePaste}
                placeholder="Start typing here..."
                className="min-h-[100px] bg-card border-border mb-4 font-mono"
                disabled={isPaused}
              />

              <div className="flex gap-3">
                <Button onClick={handlePause} variant="outline" className="gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={handleStop} variant="destructive" className="gap-2">
                  <Square className="w-4 h-4" /> Stop
                </Button>
              </div>
            </motion.div>
          )}

          {showResult && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-8">Great Job!</h2>
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
                <div className="p-4 bg-card rounded-xl">
                  <div className="text-3xl font-bold text-primary">{wpm}</div>
                  <div className="text-sm text-muted-foreground">WPM</div>
                </div>
                <div className="p-4 bg-card rounded-xl">
                  <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="p-4 bg-card rounded-xl">
                  <div className="text-3xl font-bold text-primary">{formatTime(elapsedTime)}</div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>
              <Button onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TypingGame;
