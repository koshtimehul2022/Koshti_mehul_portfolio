import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const FooterSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Brand */}
          <div>
            <h3 className="text-3xl font-bold mb-2">
              Mehul <span className="text-primary">Koshti</span>
            </h3>
            <p className="text-muted-foreground text-sm">
              Developer • Accountant • Digital Agency Owner
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {['About', 'Portfolio', 'Work', 'Resume', 'Skills', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                data-cursor-hover
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Back to Top */}
          <div className="flex justify-end">
            <button
              onClick={scrollToTop}
              data-cursor-hover
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm">Back to top</span>
              <motion.div
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all"
                whileHover={{ y: -2 }}
              >
                <ArrowUp className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mehul Koshti. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Crafted with passion & creativity
          </p>
        </div>
      </div>

      {/* Large Decorative Text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
        <p className="text-[15vw] font-bold leading-none text-foreground/[0.02] whitespace-nowrap">
          MEHUL KOSHTI
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
