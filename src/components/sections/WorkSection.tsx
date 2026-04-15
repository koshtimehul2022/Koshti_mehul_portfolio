import { useRef, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import TypingGame from '@/components/projects/TypingGame';
import SpinnerGame from '@/components/projects/SpinnerGame';
import ClickCounterGame from '@/components/projects/ClickCounterGame';
import ColorGenerator from '@/components/projects/ColorGenerator';
import NumberGuessingGame from '@/components/projects/NumberGuessingGame';
import SandPainting from '@/components/projects/SandPainting';
import BallClickGame from '@/components/projects/BallClickGame';

const funProjects = [
  { id: 'typing', title: 'Custom Typing Box', description: 'Test your typing speed with live WPM tracking.', icon: '⌨️', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'clicker', title: 'Click Counter', description: '10-second clicking challenge.', icon: '👆', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'color', title: 'Color Picker', description: 'Full color wheel with HEX, RGB, RGBA.', icon: '🎨', color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'number', title: 'Number Guessing', description: 'Guess the secret number with hints.', icon: '🔢', color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'sand', title: 'Sand Painting', description: 'Relaxing falling sand simulation.', icon: '⏳', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'ball', title: 'Ball Click Game', description: 'Click randomly appearing balls!', icon: '🎯', color: 'from-rose-500/20 to-pink-500/20' },
  { id: 'spinner', title: 'Custom Spinner', description: 'Add options and let fate decide!', icon: '🎡', color: 'from-purple-500/20 to-pink-500/20' },
];


interface LiveProject {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  project_url: string | null;
  sort_order: number | null;
}

interface WorkSectionProps {
  activeProject: string | null;
  setActiveProject: Dispatch<SetStateAction<string | null>>;
}

const WorkSection = ({ activeProject, setActiveProject }: WorkSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [liveProjects, setLiveProjects] = useState<LiveProject[]>([]);

  useEffect(() => {
    supabase.from('projects').select('*').eq('project_type', 'live').order('sort_order', { ascending: true }).then(({ data }) => {
      if (data) setLiveProjects(data);
    });
  }, []);


  useEffect(() => {
    const nav = document.querySelector('nav.fixed');
    if (activeProject) {
      nav?.classList.add('hidden');
    } else {
      nav?.classList.remove('hidden');
    }
    return () => { nav?.classList.remove('hidden'); };
  }, [activeProject]);

  const renderGameComponent = () => {
    switch (activeProject) {
      case 'typing': return <TypingGame onClose={() => setActiveProject(null)} />;
      case 'spinner': return <SpinnerGame onClose={() => setActiveProject(null)} />;
      case 'clicker': return <ClickCounterGame onClose={() => setActiveProject(null)} />;
      case 'color': return <ColorGenerator onClose={() => setActiveProject(null)} />;
      case 'number': return <NumberGuessingGame onClose={() => setActiveProject(null)} />;
      case 'sand': return <SandPainting onClose={() => setActiveProject(null)} />;
      case 'ball': return <BallClickGame onClose={() => setActiveProject(null)} />;
      default: return null;
    }
  };

  const handleLiveProjectClick = (e: React.MouseEvent, link: string | null) => {
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <section ref={sectionRef} id="work" className="py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          {/* ===== FUN PROJECTS SECTION ===== */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-primary text-sm font-medium tracking-widest uppercase"
          >
            Interactive
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-display mt-4 mb-8"
          >
            Fun
            <br />
            <span className="text-gradient">Projects</span>
          </motion.h2>

          <div className="pb-4 -mx-6 px-6 mb-4">
            <motion.div className="horizontal-scroll-container">
              {funProjects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setActiveProject(project.id)}
                  className="group cursor-pointer w-[240px] sm:w-[270px] md:w-[300px] flex-shrink-0"
                  data-cursor-hover
                  data-cursor-text="Play"
                >
                  <div className={`relative bg-gradient-to-br ${project.color} rounded-2xl overflow-hidden h-[240px] sm:h-[260px] md:h-[280px]`}>
                    <div className="absolute inset-0 bg-card/80 group-hover:bg-card/60 transition-colors duration-500" />
                    <div className="relative h-full p-5 flex flex-col justify-between">
                      <div className="text-4xl">{project.icon}</div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">Fun Project</span>
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                    <motion.div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:border-primary transition-all duration-300"
                    >
                      <ArrowUpRight className="w-3 h-3 group-hover:text-primary-foreground transition-colors" />
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center text-muted-foreground text-sm mt-2 mb-24"
          >
            ← Scroll horizontally to see more →
          </motion.p>

          {/* ===== LIVE PROJECTS SECTION ===== */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-primary text-sm font-medium tracking-widest uppercase"
          >
            Commercial
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-display mt-4 mb-8"
          >
            Live
            <br />
            <span className="text-gradient">Projects</span>
          </motion.h2>

          {liveProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveProjects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={(e) => handleLiveProjectClick(e, project.project_url)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl"
                  data-cursor-hover
                  data-cursor-text="Visit"
                >
                  <div className="relative w-full min-h-[180px] aspect-[16/9] sm:aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden rounded-2xl">
                    {project.poster_url && (
                      <div className="absolute inset-0">
                        <img
                          src={project.poster_url}
                          alt={project.title}
                          className="w-full h-full object-contain sm:object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">Live Project</span>
                        <motion.div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                          <ExternalLink className="w-3 h-3 group-hover:text-primary-foreground transition-colors" />
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-xs line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="text-center text-muted-foreground py-12"
            >
              Live projects coming soon...
            </motion.p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {activeProject && renderGameComponent()}
      </AnimatePresence>
    </>
  );
};

export default WorkSection;
