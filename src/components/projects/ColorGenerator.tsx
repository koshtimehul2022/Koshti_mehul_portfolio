import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ColorGeneratorProps {
  onClose: () => void;
}

const ColorGenerator = ({ onClose }: ColorGeneratorProps) => {
  const [hue, setHue] = useState(200);
  const [saturation, setSaturation] = useState(80);
  const [brightness, setBrightness] = useState(60);
  const [opacity, setOpacity] = useState(100);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  // Draw color wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;

    ctx.clearRect(0, 0, size, size);

    // Draw hue wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * (Math.PI / 180);
      const endAngle = (angle + 1) * (Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, ${saturation}%, ${brightness}%)`;
      ctx.fill();
    }

    // White center gradient
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw selector
    const selectorAngle = (hue - 90) * (Math.PI / 180);
    const selectorRadius = radius * 0.7;
    const sx = center + Math.cos(selectorAngle) * selectorRadius;
    const sy = center + Math.sin(selectorAngle) * selectorRadius;

    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hue, saturation, brightness]);

  const handleWheelInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    setHue(((angle % 360) + 360) % 360);
  }, []);

  // Color conversions
  const hslToRgb = useCallback(() => {
    const h = hue / 360;
    const s = saturation / 100;
    const l = brightness / 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }, [hue, saturation, brightness]);

  const rgb = hslToRgb();
  const hexValue = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
  const rgbValue = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbaValue = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)})`;

  const copyToClipboard = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast.success(`Copied ${format}!`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const colorFormats = [
    { label: 'HEX', value: hexValue, format: 'hex' },
    { label: 'RGB', value: rgbValue, format: 'rgb' },
    { label: 'RGBA', value: rgbaValue, format: 'rgba' },
  ];

  const sliders = [
    { label: 'Hue', value: hue, max: 360, set: setHue, bg: `linear-gradient(to right, hsl(0,${saturation}%,${brightness}%), hsl(60,${saturation}%,${brightness}%), hsl(120,${saturation}%,${brightness}%), hsl(180,${saturation}%,${brightness}%), hsl(240,${saturation}%,${brightness}%), hsl(300,${saturation}%,${brightness}%), hsl(360,${saturation}%,${brightness}%))` },
    { label: 'Saturation', value: saturation, max: 100, set: setSaturation, bg: `linear-gradient(to right, hsl(${hue},0%,${brightness}%), hsl(${hue},100%,${brightness}%))` },
    { label: 'Brightness', value: brightness, max: 100, set: setBrightness, bg: `linear-gradient(to right, hsl(${hue},${saturation}%,0%), hsl(${hue},${saturation}%,50%), hsl(${hue},${saturation}%,100%))` },
    { label: 'Opacity', value: opacity, max: 100, set: setOpacity, bg: `linear-gradient(to right, transparent, hsl(${hue},${saturation}%,${brightness}%))` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl overflow-auto"
    >
      <div className="container mx-auto px-6 py-20 max-w-4xl">
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
          Color <span className="text-gradient">Picker</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-12 text-center"
        >
          Pick any color from the wheel and fine-tune with controls
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Color Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <canvas
              ref={wheelRef}
              width={280}
              height={280}
              className="rounded-full cursor-crosshair"
              onMouseDown={(e) => { isDragging.current = true; handleWheelInteraction(e); }}
              onMouseMove={(e) => isDragging.current && handleWheelInteraction(e)}
              onMouseUp={() => isDragging.current = false}
              onMouseLeave={() => isDragging.current = false}
            />

            {/* Color Preview */}
            <div
              className="w-full h-24 rounded-2xl border border-border shadow-lg"
              style={{
                backgroundColor: rgbaValue,
              }}
            />
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Sliders */}
            {sliders.map(({ label, value, max, set, bg }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{Math.round(value)}</span>
                </div>
                <div className="relative h-8 rounded-full overflow-hidden border border-border">
                  <div className="absolute inset-0" style={{ background: bg }} />
                  <input
                    type="range"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => set(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-foreground/30 shadow-md pointer-events-none"
                    style={{ left: `calc(${(value / max) * 100}% - 10px)` }}
                  />
                </div>
              </div>
            ))}

            {/* Color Values */}
            <div className="space-y-3 pt-4">
              {colorFormats.map(({ label, value, format }) => (
                <motion.div
                  key={format}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(value, label)}
                  className="flex items-center justify-between p-3 bg-card rounded-xl cursor-pointer hover:bg-card/80 transition-colors group"
                >
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="font-mono text-sm font-medium">{value}</div>
                  </div>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {copiedFormat === format ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorGenerator;
