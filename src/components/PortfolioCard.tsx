import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';

export type PortfolioItem = {
  id: string | number;
  title: string;
  category: string;
  image: string;
  description?: string | null;
};

type PortfolioCardProps = {
  item: PortfolioItem;
  onOpen?: (item: PortfolioItem) => void;
  index?: number;
  className?: string;
};

const PortfolioCard = ({ item, onOpen, index = 0, className }: PortfolioCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: 40, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
    className={`group relative overflow-hidden rounded-2xl ${className ?? ''} ${onOpen ? 'cursor-pointer' : ''}`}
    onClick={onOpen ? () => onOpen(item) : undefined}
    data-cursor-hover={onOpen ? true : undefined}
    data-cursor-text={onOpen ? 'View' : undefined}
  >
    <div className="relative overflow-hidden aspect-[3/4]">
      <motion.img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover bg-transparent transition-transform duration-700 group-hover:scale-110"
        whileHover={{ filter: 'brightness(1.1)' }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
        <span className="text-primary text-sm font-medium mb-2">{item.category}</span>
        <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <ZoomIn className="w-4 h-4" />
          <span className="text-sm">Click to view</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default PortfolioCard;
