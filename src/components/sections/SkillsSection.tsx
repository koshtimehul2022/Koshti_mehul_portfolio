import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code2, Palette, TrendingUp, Zap, Globe, Layers, Camera, Video, Megaphone, Instagram, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const staticSkills = [
  {
    icon: Code2,
    title: 'Creative Development',
    description: 'Building immersive web experiences with cutting-edge technologies.',
    technologies: ['React', 'Three.js', 'WebGL', 'GSAP', 'TypeScript'],
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Crafting intuitive interfaces with pixel-perfect attention to detail.',
    technologies: ['Figma', 'Framer', 'Design Systems', 'Prototyping'],
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Digital Marketing',
    description: 'Data-driven strategies that drive growth and engagement.',
    technologies: ['SEO', 'PPC', 'Analytics', 'Social Media', 'Email'],
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Optimizing for speed, accessibility, and search rankings.',
    technologies: ['Core Web Vitals', 'A11y', 'PWA', 'Edge Functions'],
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: Globe,
    title: 'Brand Strategy',
    description: 'Building memorable brands that resonate with audiences.',
    technologies: ['Identity', 'Positioning', 'Messaging', 'Guidelines'],
    gradient: 'from-red-500/20 to-rose-500/20',
  },
  {
    icon: Layers,
    title: 'Full-Stack',
    description: 'End-to-end development from database to deployment.',
    technologies: ['Node.js', 'PostgreSQL', 'AWS', 'Vercel', 'Docker'],
    gradient: 'from-indigo-500/20 to-violet-500/20',
  },
  {
    icon: Camera,
    title: 'Product Photography',
    description: 'Capturing high-quality product visuals that enhance brand identity and drive engagement.',
    technologies: ['Lighting', 'E-commerce', 'Branding', 'Editing'],
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    icon: Video,
    title: 'Reels & Video Editing',
    description: 'Creating engaging short-form videos optimized for social media growth and audience retention.',
    technologies: ['Reels', 'Short Videos', 'Transitions', 'Storytelling'],
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    icon: Megaphone,
    title: 'Ads Management',
    description: 'Managing and optimizing ad campaigns to maximize reach, performance, and ROI.',
    technologies: ['Facebook Ads', 'Instagram Ads', 'Google Ads', 'Analytics'],
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  {
    icon: Instagram,
    title: 'Instagram Management',
    description: 'Growing and managing Instagram accounts with strategic content and engagement.',
    technologies: ['Growth', 'Content Strategy', 'Insights', 'Engagement'],
    gradient: 'from-fuchsia-500/20 to-pink-500/20',
  },
  {
    icon: PenTool,
    title: 'Content Creator',
    description: 'Crafting creative content that builds brand presence and connects with the audience.',
    technologies: ['Creative', 'Social Media', 'Brand Voice', 'Content'],
    gradient: 'from-teal-500/20 to-cyan-500/20',
  },
  {
    icon: Palette,
    title: 'Graphic Designer',
    description: 'Designing visually impactful graphics to communicate ideas and elevate branding.',
    technologies: ['Branding', 'UI/UX', 'Design', 'Creativity'],
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  
];

const iconAnimations = [
  { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] },
  { rotate: [0, -5, 5, 0], y: [0, -3, 0] },
  { scale: [1, 1.2, 1], rotate: [0, 5, 0] },
  { x: [0, 2, -2, 0], scale: [1, 1.15, 1] },
  { rotate: [0, 360], transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
  { y: [0, -5, 0], scale: [1, 1.1, 1] },
];

type SkillCard = {
  icon: React.ComponentType<{ className?: string }> | string | null;
  title: string;
  description: string;
  technologies?: string[];
  gradient?: string;
  tags?: string[];
};

type DbSkill = {
  id: string;
  name: string;
  title: string | null;
  category: string;
  description: string | null;
  icon: string | null;
  level: number | null;
  tags: string[] | null;
};

const SkillsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [dbSkills, setDbSkills] = useState<DbSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('id,name,title,category,description,icon,level,tags')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setDbSkills(data as DbSkill[]);
      }
      setLoading(false);
    };
    fetchSkills();
  }, []);

  const mergedSkills: SkillCard[] = [
    ...staticSkills.map(skill => ({
      icon: skill.icon,
      title: skill.title,
      description: skill.description,
      technologies: skill.technologies,
      gradient: skill.gradient,
    })),
    ...dbSkills.map(skill => ({
      icon: skill.icon,
      title: skill.title || skill.name,
      description: skill.description || skill.category || 'Powered by database-driven skills.',
      tags: skill.tags || (skill.level ? [`Level ${skill.level}`] : []),
      gradient: 'from-slate-900/10 to-slate-700/10',
    })),
  ];

  if (loading) {
    return (
      <section ref={sectionRef} id="skills" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center py-20 text-muted-foreground">Loading skills...</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="skills" className="py-32">
      <div className="container mx-auto px-6">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-primary text-sm font-medium tracking-widest uppercase"
        >
          Skills & Services
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-display mt-4 mb-16"
        >
          What I
          <br />
          <span className="text-gradient">Bring</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mergedSkills.map((skill, index) => {
            const fromLeft = index % 2 === 0;
            const iconElement = typeof skill.icon === 'string'
              ? skill.icon.startsWith('http')
                ? <img src={skill.icon} alt={skill.title} className="w-7 h-7 object-cover rounded" />
                : <span className="text-sm font-semibold text-muted-foreground">{skill.icon.charAt(0).toUpperCase()}</span>
              : skill.icon
                ? (() => {
                    const Icon = skill.icon as React.ComponentType<{ className?: string }>;
                    return <Icon className="w-7 h-7 text-primary" />;
                  })()
                : <span className="text-sm font-semibold text-muted-foreground">{skill.title.charAt(0).toUpperCase()}</span>;

            return (
              <motion.div
                key={`${index}-${skill.title}`}
                initial={{ 
                  opacity: 0, 
                  x: fromLeft ? -60 : 60, 
                  rotateY: fromLeft ? -10 : 10,
                  rotateX: -5,
                }}
                animate={isInView ? { opacity: 1, x: 0, rotateY: 0, rotateX: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.12 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                data-cursor-hover
                className={`group relative p-8 rounded-2xl bg-gradient-to-br ${skill.gradient} border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden`}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
                  }}
                />

                <div className="absolute inset-0 bg-card/90 group-hover:bg-card/80 transition-colors duration-500" />

                <div className="relative z-10">
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors relative overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 hsl(var(--primary) / 0)',
                          '0 0 0 8px hsl(var(--primary) / 0.1)',
                          '0 0 0 0 hsl(var(--primary) / 0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                    {iconElement}
                  </motion.div>

                  <motion.h3 
                    className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {skill.title}
                  </motion.h3>
                  
                  <p className="text-muted-foreground mb-6">{skill.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {(skill.technologies || skill.tags || []).map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.4 + index * 0.1 + techIndex * 0.05 
                        }}
                        whileHover={{ 
                          scale: 1.1, 
                          backgroundColor: 'hsl(var(--primary) / 0.2)',
                          color: 'hsl(var(--primary))',
                        }}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground cursor-default transition-colors"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 60%)',
                  }}
                />

                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
