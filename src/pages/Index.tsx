import { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import CustomCursor from '@/components/CustomCursor';
import ParticleSystem from '@/components/ParticleSystem';
import Navigation from '@/components/Navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import ThemeHint from '@/components/ThemeHint';
import PageLoader from '@/components/PageLoader';
import SocialSidebar from '@/components/SocialSidebar';
import RippleEffect from '@/components/RippleEffect';
import HeroSection from '@/components/sections/HeroSection';
import RoleShowcaseSection from '@/components/sections/RoleShowcaseSection';
import SoundToggle from '@/components/SoundToggle';
import AboutSection from '@/components/sections/AboutSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import WorkSection from '@/components/sections/WorkSection';
import ResumeSection from '@/components/sections/ResumeSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';
import FooterSection from '@/components/sections/FooterSection';
import { useGsapScrollTrigger } from '@/hooks/useGsapScrollTrigger';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useGsapScrollTrigger();

  return (
    <ThemeProvider>
      {isLoading && <PageLoader onComplete={() => setIsLoading(false)} />}
      
      <div className={`relative min-h-screen grain ${isLoading ? 'overflow-hidden h-screen' : ''}`}>
        <CustomCursor />
        <ParticleSystem />
        <RippleEffect />

        {!isLoading && <Navigation />}
        {!isLoading && <ThemeSwitcher />}
        {!isLoading && <ThemeHint />}
        {!isLoading && <SocialSidebar />}
        {!isLoading && !activeProject && <SoundToggle />}

        <main className="relative z-10">
          <div className="relative overflow-hidden">
            <HeroSection />
          </div>
          <div className="relative overflow-hidden">
            <RoleShowcaseSection />
          </div>
          <div className="relative overflow-hidden">
            <AboutSection />
          </div>
          <div className="relative overflow-hidden">
            <PortfolioSection />
          </div>
          <div className="relative overflow-hidden">
            <WorkSection activeProject={activeProject} setActiveProject={setActiveProject} />
          </div>
          <div className="relative overflow-hidden">
            <ResumeSection />
          </div>
          <div className="relative overflow-hidden">
            <SkillsSection />
          </div>
          <div className="relative overflow-hidden">
            <ContactSection />
          </div>
          <FooterSection />
        </main>

        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
