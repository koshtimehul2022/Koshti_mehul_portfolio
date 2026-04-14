import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import PortfolioCard, { PortfolioItem } from '../components/PortfolioCard';
import MehulImage from '../assets/Mehul.png';

const staticPortfolio: PortfolioItem[] = [
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

const PortfolioAll = () => {
  const navigate = useNavigate();
  const [dbItems, setDbItems] = useState<DbPortfolioItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(false);

      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('id,title,category,media_url,media_type,description')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('PortfolioAll fetch failed:', error.message);
          setError(true);
          return;
        }

        if (data) {
          setDbItems(data as DbPortfolioItem[]);
        }
      } catch (err) {
        console.error('PortfolioAll fetch exception:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const portfolioItems = useMemo<PortfolioItem[]>(() => {
    const existingTitles = new Set(staticPortfolio.map((item) => item.title.trim().toLowerCase()));

    return [
      ...staticPortfolio,
      ...dbItems
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
  }, [dbItems]);

  return (
    <section className="py-32 min-h-screen bg-background">
      <div className="container mx-auto px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary text-sm font-medium tracking-widest uppercase"
          >
            Portfolio
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-display mt-4"
          >
            All Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 max-w-2xl text-muted-foreground"
          >
            Browse every portfolio item from the static collection plus items loaded from Supabase.
          </motion.p>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground">Loading portfolio items...</div>
        )}

        {error && (
          <div className="text-center text-destructive mb-6">
            Could not load portfolio items from the database. Showing static items only.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {portfolioItems.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              onOpen={setSelectedImage}
              index={index}
              className="w-full"
            />
          ))}
        </div>
      </div>

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

export default PortfolioAll;
