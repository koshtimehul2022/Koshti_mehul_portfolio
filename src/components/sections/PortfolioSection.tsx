import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import PortfolioCard, { PortfolioItem } from '../PortfolioCard';
import MehulImage from '../../assets/Mehul.png';

const portfolioItems = [
  { id: 1, title: 'Abstract Dreams', category: 'Digital Art', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=800&fit=crop' },
  { id: 2, title: 'Urban Geometry', category: 'Photography', image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&h=600&fit=crop' },
  { id: 3, title: 'Mehul Koshti', category: 'Personal Brand', image: MehulImage },
  { id: 4, title: 'Neon Nights', category: 'Digital Art', image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&h=700&fit=crop' },
  { id: 5, title: 'Fluid Motion', category: 'Generative', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop' },
  { id: 6, title: 'Crystal Waves', category: 'Experimental', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop' },
];

type DbPortfolioItem = {
  id: string;
  title: string;
  category: string | null;
  media_url: string | null;
  media_type: string | null;
  description: string | null;
};

const PortfolioSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [dbPortfolioItems, setDbPortfolioItems] = useState<DbPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const finalPortfolio = useMemo<PortfolioItem[]>(() => {
    const existingTitles = new Set(portfolioItems.map((item) => item.title.trim().toLowerCase()));

    return [
      ...portfolioItems,
      ...dbPortfolioItems
        .filter((item) => item.media_url && item.title)
        .map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category || 'Portfolio',
          image: item.media_url || '',
          description: item.description,
        }))
        .filter((item) => !existingTitles.has(item.title.trim().toLowerCase())),
    ];
  }, [dbPortfolioItems]);

  const limitedPortfolio = finalPortfolio.slice(0, 6);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setHasError(false);

      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('id,title,category,media_url,media_type,description')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Portfolio fetch failed:', error.message);
          setHasError(true);
          return;
        }

        if (data) {
          setDbPortfolioItems(data as DbPortfolioItem[]);
        }
      } catch (fetchError) {
        console.error('Portfolio fetch exception:', fetchError);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="py-32 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-primary text-sm font-medium tracking-widest uppercase"
        >
          Art & Creativity
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-display mt-4 mb-16"
        >
          Creative
          <br />
          <span className="text-gradient">Portfolio</span>
        </motion.h2>

        <div className="pb-6 -mx-6 px-6">
          <div className="horizontal-scroll-container">
            {limitedPortfolio.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onOpen={setSelectedImage}
                index={index}
                className="w-[280px] sm:w-[320px] md:w-[360px]"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => window.open('/portfolio/all', '_blank')}
            className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Explore More Projects →
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-xl p-6"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                <span className="text-primary text-sm font-medium">{selectedImage.category}</span>
                <h3 className="text-2xl font-semibold mt-1">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PortfolioSection;
