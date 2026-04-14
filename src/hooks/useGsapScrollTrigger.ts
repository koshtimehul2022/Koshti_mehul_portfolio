import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import scrollSound from '@/assets/scroll-up-scroll-down-102362.mp3';
import { playSoundOnce, stopSound } from '@/lib/soundManager';

gsap.registerPlugin(ScrollTrigger);

export const useGsapScrollTrigger = () => {
  useEffect(() => {
    const playScrollSound = (() => {
      let lastPlay = 0;
      return () => {
        const now = Date.now();
        if (now - lastPlay < 180) return;
        lastPlay = now;
        playSoundOnce(scrollSound, 0.18);
      };
    })();

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
      setupHorizontalScroll(playScrollSound);
    }, 500);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    function setupHorizontalScroll(playScrollSound: () => void) {
      const horizontalSections = document.querySelectorAll('.horizontal-scroll-container');

      horizontalSections.forEach((container) => {
        const el = container as HTMLElement;
        const scrollWidth = el.scrollWidth;
        const containerWidth = el.offsetWidth;
        const scrollDistance = scrollWidth - containerWidth;

        if (scrollDistance <= 0) return;

        const wrapper = el.parentElement;
        if (!wrapper) return;

        const onScrollInput = () => playScrollSound();
        wrapper.addEventListener('wheel', onScrollInput, { passive: true });
        wrapper.addEventListener('touchmove', onScrollInput, { passive: true });

        // Calculate so last card center aligns with viewport center
        const lastCard = el.lastElementChild as HTMLElement;
        const lastCardCenter = lastCard ? lastCard.offsetLeft + lastCard.offsetWidth / 2 : scrollWidth;
        const viewportCenter = containerWidth / 2;
        const adjustedDistance = lastCardCenter - viewportCenter;
        const finalDistance = Math.min(Math.max(adjustedDistance, 0), scrollDistance);

        gsap.to(el, {
          x: -finalDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'center center',
            end: () => `+=${finalDistance}`,
            scrub: 1,
            pin: true,
            pinType: 'transform',
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const cleanup = () => {
          wrapper.removeEventListener('wheel', onScrollInput);
          wrapper.removeEventListener('touchmove', onScrollInput);
        };

        // Store cleanup handler on the wrapper so it can be removed later if needed
        (wrapper as any).__gsapScrollCleanup = cleanup;
      });
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
      const horizontalSections = document.querySelectorAll('.horizontal-scroll-container');
      horizontalSections.forEach((container) => {
        const wrapper = container.parentElement;
        const cleanup = wrapper && (wrapper as any).__gsapScrollCleanup;
        if (typeof cleanup === 'function') cleanup();
      });
      stopSound(scrollSound);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
};

export const animateOnScroll = (
  element: HTMLElement | null,
  animation: gsap.TweenVars,
  triggerOptions?: ScrollTrigger.Vars
) => {
  if (!element) return;

  gsap.to(element, {
    ...animation,
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      end: 'bottom 15%',
      toggleActions: 'play none none reverse',
      ...triggerOptions,
    },
  });
};
