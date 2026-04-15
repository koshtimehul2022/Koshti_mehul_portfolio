import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const COOLDOWN_KEY = 'contact_last_submit_time';
const COOLDOWN_DURATION = 5 * 60 * 1000;

const ContactSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    botField: '',
  });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { settings, loading } = useSettings();

  const isSubmitDisabled = cooldownRemaining > 0 || formStatus === 'sending';
  const feedbackMessage = statusMessage || (cooldownRemaining > 0
    ? `Please wait ${Math.floor(cooldownRemaining / 60000)}:${String(Math.floor((cooldownRemaining % 60000) / 1000)).padStart(2, '0')} before submitting again`
    : '');
  const feedbackClass = formStatus === 'error'
    ? 'text-destructive'
    : formStatus === 'success'
      ? 'text-foreground'
      : 'text-muted-foreground';

  const emailValue = settings?.email ?? 'hello@example.com';
  const phoneValue = settings?.phone ?? '+91 00000 00000';
  const locationValue = settings?.location ?? 'Location not available';
  const whatsappValue = settings?.whatsapp ?? '';

  useEffect(() => {
    const updateCooldown = () => {
      const lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || '0');
      const remaining = lastSubmit ? Math.max(0, COOLDOWN_DURATION - (Date.now() - lastSubmit)) : 0;
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: loading ? 'Loading...' : emailValue,
      href: settings?.email ? `mailto:${settings.email}` : '#',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: loading ? 'Loading...' : phoneValue,
      href: settings?.phone ? `tel:${settings.phone.replace(/\D/g, '')}` : '#',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: loading ? 'Loading...' : locationValue,
      href: settings?.location
        ? `https://maps.google.com/search/${encodeURIComponent(settings.location)}`
        : '#',
    },
  ];

  const normalizeUrl = (value: string | null | undefined, fallback: string) => {
    if (!value) return fallback;
    return value.startsWith('http') ? value : `https://${value}`;
  };

  const socials = [
    {
      name: 'WhatsApp',
      href: whatsappValue ? `https://wa.me/${whatsappValue.replace(/\D/g, '')}` : '#',
    },
    {
      name: 'Facebook',
      href: normalizeUrl(settings?.facebook, 'https://facebook.com'),
    },
    {
      name: 'LinkedIn',
      href: normalizeUrl(settings?.linkedin, 'https://linkedin.com'),
    },
    {
      name: 'YouTube',
      href: normalizeUrl(settings?.youtube, 'https://youtube.com'),
    },
    {
      name: 'GitHub',
      href: normalizeUrl(settings?.github, 'https://github.com'),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setFormStatus('sending');
    setStatusMessage('');

    const isNonEmptyString = (value: string) => value.trim().length > 0;
    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const errors: string[] = [];

    if (!isNonEmptyString(formState.name)) errors.push('Name is required.');
    if (!isNonEmptyString(formState.email) || !isValidEmail(formState.email)) errors.push('A valid email is required.');
    if (!isNonEmptyString(formState.phone)) errors.push('Phone is required.');
    if (!isNonEmptyString(formState.message)) errors.push('Message is required.');

    if (errors.length > 0) {
      setFormStatus('error');
      setStatusMessage(errors.join(' '));
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          message: formState.message.trim(),
          botField: formState.botField,
        }),
      });

      const responseBody = await response.text();
      let result: { success?: boolean; message?: string; errors?: string[] } | null = null;

      if (responseBody) {
        try {
          result = JSON.parse(responseBody);
        } catch (parseError) {
          throw new Error('Invalid response from server.');
        }
      }

      if (!response.ok) {
        throw new Error(result?.message || 'Server error while submitting the form.');
      }

      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Submission failed.');
      }

      const now = Date.now();
      localStorage.setItem(COOLDOWN_KEY, now.toString());
      setCooldownRemaining(COOLDOWN_DURATION);
      setFormStatus('success');
      setStatusMessage('Message sent successfully! Please wait 5 minutes before submitting again.');
      setFormState({ name: '', email: '', phone: '', message: '', botField: '' });
    } catch (error) {
      console.error('Contact submission error', error);
      setFormStatus('error');
      setStatusMessage(
        error instanceof Error
          ? `Submission failed: ${error.message}`
          : 'Submission failed. Please try again later.'
      );
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-primary text-sm font-medium tracking-widest uppercase"
            >
              Get in Touch
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-display mt-4 mb-8"
            >
              Let's Create
              <br />
              <span className="text-gradient">Together</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body-lg mb-12"
            >
              Have a project in mind? I'd love to hear about it. Let's discuss
              how we can bring your vision to life.
            </motion.p>

            {/* Contact Info */}
            <div className="space-y-6 mb-12">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  data-cursor-hover
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Socials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  data-cursor-hover
                  className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <span className="text-sm">{social.name}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative p-8 rounded-2xl bg-card border border-border"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState({ ...formState, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>

              <input
                type="text"
                name="botField"
                value={formState.botField}
                onChange={(e) =>
                  setFormState({ ...formState, botField: e.target.value })
                }
                autoComplete="off"
                tabIndex={-1}
                className="absolute left-[-9999px] opacity-0 pointer-events-none"
                aria-hidden="true"
              />

              <button
                type="submit"
                data-cursor-hover
                disabled={isSubmitDisabled}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{formStatus === 'sending' ? 'Sending...' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </button>

              {feedbackMessage && (
                <p className={`mt-4 text-sm ${feedbackClass}`} aria-live="polite">
                  {feedbackMessage}
                </p>
              )}
            </div>

            {/* Decorative */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
