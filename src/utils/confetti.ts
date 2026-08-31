import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3298DC', '#FFBC00', '#E03E2D', '#2ECC71', '#FFFFFF']
    });
  } catch (e) {
    console.log('Confetti trigger skipped', e);
  }
};

export const triggerMegaConfetti = () => {
  try {
    const end = Date.now() + 1000;
    const colors = ['#3298DC', '#FFBC00', '#E03E2D', '#2ECC71', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.log('Mega confetti skipped', e);
  }
};
