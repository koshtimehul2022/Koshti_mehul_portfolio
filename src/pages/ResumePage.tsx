import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, GraduationCap, Briefcase, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import scrollSound from '@/assets/scroll-up-scroll-down-102362.mp3';
import { playSoundOnce, stopSound } from '@/lib/soundManager';

const education = [
  { year: '2018 - 2020', title: 'Master of Digital Arts', institution: 'Royal College of Art, London' },
  { year: '2014 - 2018', title: 'BSc Computer Science', institution: 'MIT, Massachusetts' },
  { year: '2012 - 2014', title: 'Digital Marketing Certification', institution: 'Google & HubSpot Academy' },
];

const experience = [
  { year: '2022 - Present', title: 'Founder & Creative Director', company: 'Studio M — Digital Agency' },
  { year: '2020 - 2022', title: 'Senior Creative Developer', company: 'Active Theory' },
  { year: '2018 - 2020', title: 'Digital Marketing Lead', company: 'Growth Labs' },
  { year: '2016 - 2018', title: 'Frontend Developer', company: 'Ueno' },
];

type ResumeDbSkill = {
  name: string;
  title: string | null;
};

const skills = [
  'React', 'TypeScript', 'Node.js', 'Three.js', 'Figma', 'After Effects',
  'Premiere Pro', 'SEO', 'Google Ads', 'Social Media Marketing', 'Tally ERP', 'Accounting',
];

const ResumePage = () => {
  const navigate = useNavigate();
  const [dbSkills, setDbSkills] = useState<ResumeDbSkill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('name,title')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbSkills(data as ResumeDbSkill[]);
      }
    };

    fetchSkills();
  }, []);

  const allSkills = useMemo(
    () => [
      ...skills,
      ...dbSkills.map((skill) => skill.title?.trim() || skill.name.trim()),
    ],
    [dbSkills]
  );

  useEffect(() => {
    const playScroll = () => {
      playSoundOnce(scrollSound, 0.18);
    };

    window.addEventListener('wheel', playScroll, { passive: true });
    window.addEventListener('touchmove', playScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', playScroll);
      window.removeEventListener('touchmove', playScroll);
      stopSound(scrollSound);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Name & Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-3">Mehul</h1>
          <p className="text-lg text-muted-foreground">Full Stack Developer · Creative Director · Digital Marketer</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Education */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Education</h2>
            </div>
            <div className="space-y-6">
              {education.map((e, i) => (
                <div key={i} className="pl-4 border-l-2 border-primary/30">
                  <p className="text-xs text-primary font-medium">{e.year}</p>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.institution}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Experience</h2>
            </div>
            <div className="space-y-6">
              {experience.map((e, i) => (
                <div key={i} className="pl-4 border-l-2 border-primary/30">
                  <p className="text-xs text-primary font-medium">{e.year}</p>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.company}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Download Resume Button — between Education/Experience and Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex justify-center mt-12 mb-4"
        >
          <a
            href="#"
            download
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium text-sm overflow-hidden transition-all duration-500 hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] p-[1.5px]">
              <span className="block w-full h-full rounded-full bg-background" />
            </span>
            <span className="relative z-10 flex items-center gap-3 text-foreground group-hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
              Download Resume
            </span>
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_hsl(var(--primary)/0.4)]" />
          </a>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Skills</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumePage;
