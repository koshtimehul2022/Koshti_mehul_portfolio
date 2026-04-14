import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SandPaintingProps {
  onClose: () => void;
}

const CELL_SIZE = 4;

const SandPainting = ({ onClose }: SandPaintingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<(string | null)[][]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#E5B45A');
  const animationRef = useRef<number>();
  const gridDims = useRef({ cols: 0, rows: 0 });

  const colors = [
    '#E5B45A', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEEAD', '#DDA0DD', '#F4A460',
  ];

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cols = Math.floor(canvas.width / CELL_SIZE);
    const rows = Math.floor(canvas.height / CELL_SIZE);
    gridDims.current = { cols, rows };
    gridRef.current = Array.from({ length: rows }, () => Array(cols).fill(null));
  }, []);

  const clearCanvas = () => {
    initGrid();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'hsl(0, 0%, 7%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      initGrid();
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [initGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawnTime = 0;
    const spawnInterval = 30;

    const animate = (timestamp: number) => {
      const grid = gridRef.current;
      const { cols, rows } = gridDims.current;

      // Spawn new sand at mouse position
      if (timestamp - lastSpawnTime > spawnInterval) {
        const mx = Math.floor(mouseRef.current.x / CELL_SIZE);
        for (let i = -2; i <= 2; i++) {
          const col = mx + i + Math.floor((Math.random() - 0.5) * 3);
          if (col >= 0 && col < cols && grid[0] && !grid[0][col]) {
            grid[0][col] = selectedColor;
          }
        }
        lastSpawnTime = timestamp;
      }

      // Simulate sand falling (bottom-up to avoid double moves)
      for (let r = rows - 2; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
          if (!grid[r][c]) continue;
          const color = grid[r][c];

          // Try falling straight down
          if (!grid[r + 1][c]) {
            grid[r + 1][c] = color;
            grid[r][c] = null;
          }
          // Try falling diagonally
          else {
            const goLeft = Math.random() > 0.5;
            const c1 = goLeft ? c - 1 : c + 1;
            const c2 = goLeft ? c + 1 : c - 1;

            if (c1 >= 0 && c1 < cols && !grid[r + 1][c1]) {
              grid[r + 1][c1] = color;
              grid[r][c] = null;
            } else if (c2 >= 0 && c2 < cols && !grid[r + 1][c2]) {
              grid[r + 1][c2] = color;
              grid[r][c] = null;
            }
            // else settled - stays in place
          }
        }
      }

      // Render
      ctx.fillStyle = 'hsl(0, 0%, 7%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) {
            ctx.fillStyle = grid[r][c]!;
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, selectedColor]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-hidden"
    >
      <div className="container mx-auto px-6 py-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold">
              Sand <span className="text-gradient">Painting</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-sm">
              Move your mouse to control sand flow
            </motion.p>
          </div>
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-4 mb-4">
          <Button onClick={() => setIsPlaying(!isPlaying)} variant={isPlaying ? 'destructive' : 'default'} className="gap-2">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={clearCanvas} variant="outline" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex-grow rounded-2xl overflow-hidden bg-card">
          <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SandPainting;
