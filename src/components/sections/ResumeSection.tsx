import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, MapPin, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const education = [
  { year: '2018 - 2020', title: 'Master of Digital Arts', institution: 'Royal College of Art, London', description: 'Specialized in Interactive Media and Creative Technology.', location: 'London, UK' },
  { year: '2014 - 2018', title: 'BSc Computer Science', institution: 'MIT, Massachusetts', description: 'Focus on Human-Computer Interaction and Visual Computing.', location: 'Massachusetts, USA' },
  { year: '2012 - 2014', title: 'Digital Marketing Certification', institution: 'Google & HubSpot Academy', description: 'Advanced certifications in SEO, Analytics, and Growth Marketing.', location: 'Online' },
];

const experience = [
  { year: '2022 - Present', title: 'Founder & Creative Director', company: 'Studio M — Digital Agency', description: 'Leading a team of 15+ creatives, delivering award-winning digital experiences for Fortune 500 clients.', location: 'Remote' },
  { year: '2020 - 2022', title: 'Senior Creative Developer', company: 'Active Theory', description: 'Developed immersive WebGL experiences and interactive campaigns for global brands.', location: 'Los Angeles, USA' },
  { year: '2018 - 2020', title: 'Digital Marketing Lead', company: 'Growth Labs', description: 'Managed $5M+ in ad spend, achieving 300% ROI improvement across campaigns.', location: 'New York, USA' },
  { year: '2016 - 2018', title: 'Frontend Developer', company: 'Ueno', description: 'Built responsive, accessible websites for high-profile tech startups.', location: 'San Francisco, USA' },
];

type ResumeEntry = {
  id: string;
  title: string;
  description: string | null;
  entry_type: 'education' | 'experience';
  institution?: string;
  company?: string | null;
  location?: string | null;
  period?: string;
  start_date?: string | null;
  end_date?: string | null;
};

type TimelineItemData = {
  year: string;
  title: string;
  description: string;
  institution?: string;
  company?: string;
  location?: string;
};

const TimelineItem = ({ item, isVisible, type, direction }: {
  item: TimelineItemData; isVisible: boolean;
  type: 'education' | 'experience'; direction: 'left' | 'right';
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: direction === 'left' ? -80 : 80, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: direction === 'left' ? -80 : 80 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative pl-8 pb-12 last:pb-0"
      >
        <motion.div
          className="timeline-line"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: 'top' }}
        />
        <motion.div
          className="timeline-dot top-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 300 }}
        />

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <motion.span className="inline-flex items-center gap-1.5 text-primary text-sm font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {item.year}
            </motion.span>
            {item.location && (
              <motion.span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                <MapPin className="w-3 h-3" />
                {item.location}
              </motion.span>
            )}
          </div>
          <h4 className="text-xl font-semibold">{item.title}</h4>
          <p className="text-primary/80 text-sm font-medium">
            {type === 'education' ? item.institution : item.company}
          </p>
          <p className="text-muted-foreground mt-1">{item.description}</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ResumeSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [visibleEducation, setVisibleEducation] = useState<number[]>([]);
  const [visibleExperience, setVisibleExperience] = useState<number[]>([]);
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);
  const [resumeEntries, setResumeEntries] = useState<ResumeEntry[]>([]);

  useEffect(() => {
    supabase.from('resume_pdf').select('file_url').order('uploaded_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setResumePdfUrl(data.file_url);
    });

    const fetchResumeEntries = async () => {
      const { data, error } = await supabase
        .from('resume_entries')
        .select('id,title,description,entry_type,institution,company,location,period,start_date,end_date')
        .order('start_date', { ascending: false });
      if (!error && data) {
        setResumeEntries(data as ResumeEntry[]);
      }
    };

    fetchResumeEntries();
  }, []);

  useEffect(() => {
    const items = resumeEntries.length ? resumeEntries.filter(entry => entry.entry_type === 'education') : education;
    if (!isInView || visibleEducation.length > 0) return;
    items.forEach((_, index) => {
      setTimeout(() => setVisibleEducation(prev => [...prev, index]), 400 + index * 600);
    });
  }, [isInView, resumeEntries, visibleEducation]);

  useEffect(() => {
    const items = resumeEntries.length ? resumeEntries.filter(entry => entry.entry_type === 'experience') : experience;
    if (!isInView || visibleExperience.length > 0) return;
    items.forEach((_, index) => {
      setTimeout(() => setVisibleExperience(prev => [...prev, index]), 600 + index * 600);
    });
  }, [isInView, resumeEntries, visibleExperience]);

  const educationItems = resumeEntries.length
    ? resumeEntries
        .filter(entry => entry.entry_type === 'education')
        .map(entry => ({
          year: entry.start_date
            ? `${entry.start_date}${entry.end_date ? ` - ${entry.end_date}` : ''}`
            : entry.period || 'Year TBD',
          title: entry.title,
          description: entry.description || '',
          institution: entry.company || entry.institution || '',
          location: entry.location || '',
        }))
    : education;

  const experienceItems = resumeEntries.length
    ? resumeEntries
        .filter(entry => entry.entry_type === 'experience')
        .map(entry => ({
          year: entry.start_date
            ? `${entry.start_date}${entry.end_date ? ` - ${entry.end_date}` : ''}`
            : entry.period || 'Year TBD',
          title: entry.title,
          description: entry.description || '',
          company: entry.company || entry.institution || '',
          location: entry.location || '',
        }))
    : experience;

  return (
    <section ref={sectionRef} id="resume" className="py-32 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-20">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-primary text-sm font-medium tracking-widest uppercase"
            >
              Resume
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-display mt-4"
            >
              Education &
              <br />
              <span className="text-gradient">Experience</span>
            </motion.h2>
          </div>

          {resumePdfUrl && (
            <motion.a
              href={resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </motion.a>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Education */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <motion.div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <GraduationCap className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold">Education</h3>
            </div>

            <div className="relative">
              {educationItems.map((item, index) => (
                <TimelineItem key={`${item.title}-${index}`} item={item} isVisible={visibleEducation.includes(index)} type="education" direction="left" />
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <motion.div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Briefcase className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold">Experience</h3>
            </div>

            <div className="relative">
              {experienceItems.map((item, index) => (
                <TimelineItem key={`${item.title}-${index}`} item={item} isVisible={visibleExperience.includes(index)} type="experience" direction="right" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
