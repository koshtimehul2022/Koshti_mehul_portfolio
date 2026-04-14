const audioRegistry = new Map<string, HTMLAudioElement>();
let interactionHandler: (() => void) | null = null;

const isMuted = () => document.documentElement.getAttribute('data-sound-muted') === 'true';

const createAudio = (src: string, loop = false, volume = 0.18) => {
  let audio = audioRegistry.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audioRegistry.set(src, audio);
  } else {
    audio.loop = loop;
    audio.volume = volume;
  }
  return audio;
};

const cleanupInteraction = () => {
  if (interactionHandler) {
    window.removeEventListener('pointerdown', interactionHandler);
    window.removeEventListener('keydown', interactionHandler);
    window.removeEventListener('touchstart', interactionHandler);
    interactionHandler = null;
  }
};

const prepareUnlock = (callback: () => void) => {
  if (interactionHandler) return;

  interactionHandler = () => {
    cleanupInteraction();
    callback();
  };

  window.addEventListener('pointerdown', interactionHandler, { once: true });
  window.addEventListener('keydown', interactionHandler, { once: true });
  window.addEventListener('touchstart', interactionHandler, { once: true });
};

export const playSound = async (src: string, loop = false, volume = 0.18) => {
  if (isMuted()) return;
  const audio = createAudio(src, loop, volume);
  audio.currentTime = 0;

  try {
    await audio.play();
  } catch {
    prepareUnlock(() => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }
};

export const playSoundOnce = async (src: string, volume = 0.18) => {
  if (isMuted()) return;
  const audio = createAudio(src, false, volume);
  audio.currentTime = 0;

  try {
    await audio.play();
  } catch {
    prepareUnlock(() => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }
};

export const stopSound = (src: string) => {
  const audio = audioRegistry.get(src);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
};

export const stopAllSounds = () => {
  audioRegistry.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  cleanupInteraction();
};

export const preloadSound = (src: string, loop = false, volume = 0.18) => {
  createAudio(src, loop, volume);
};
