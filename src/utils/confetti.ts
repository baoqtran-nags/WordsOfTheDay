import confetti from 'canvas-confetti';

/**
 * Triggers a celebratory confetti effect when the user completes their final word of the day
 */
export function triggerStreakCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#fbbf24'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Right burst
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#fbbf24'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Center sparkles after 200ms
    setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 80,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#6366f1'],
        disableForReducedMotion: true,
        zIndex: 9999,
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti effect could not be triggered:', err);
  }
}
