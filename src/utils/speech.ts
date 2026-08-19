/**
 * Web Speech API (SpeechSynthesis) utility for native high-quality pronunciation
 * of advanced C1/C2 vocabulary, idioms, and example sentences.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

// Pre-load available voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.filter((v) => v.lang.startsWith('en'));
}

export function getBestEnglishVoice(accent: 'US' | 'UK' = 'US'): SpeechSynthesisVoice | null {
  const voices = getEnglishVoices();
  if (voices.length === 0) return null;

  if (accent === 'UK') {
    const ukVoice = voices.find(
      (v) =>
        (v.lang === 'en-GB' || v.lang.includes('GB') || v.name.includes('UK') || v.name.includes('British') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Kate'))
    );
    if (ukVoice) return ukVoice;
  }

  // Default to High-Quality US Voice
  const preferredNames = ['Google US English', 'Natural', 'Samantha', 'Karen', 'Victoria', 'Alex', 'David', 'Zira', 'Microsoft'];
  for (const name of preferredNames) {
    const found = voices.find((v) => v.name.includes(name) && (v.lang === 'en-US' || v.lang.startsWith('en')));
    if (found) return found;
  }

  const usVoice = voices.find((v) => v.lang === 'en-US');
  if (usVoice) return usVoice;

  return voices[0] || null;
}

export interface SpeechOptions {
  rate?: number; // default 0.88 for pedagogical phonetic clarity
  pitch?: number;
  accent?: 'US' | 'UK';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error?: any) => void;
}

export function playPronunciation(
  text: string,
  onEndOrOptions?: (() => void) | SpeechOptions,
  onErrorFallback?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof onEndOrOptions === 'object' && onEndOrOptions.onError) {
      onEndOrOptions.onError();
    } else if (onErrorFallback) {
      onErrorFallback();
    }
    return false;
  }

  try {
    // Cancel any current utterance and resume engine to avoid Chrome idle pauses
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);

    let rate = 0.88;
    let pitch = 1.0;
    let accent: 'US' | 'UK' = 'US';
    let onStart: (() => void) | undefined;
    let onEnd: (() => void) | undefined;
    let onError: (() => void) | undefined;

    if (typeof onEndOrOptions === 'function') {
      onEnd = onEndOrOptions;
      onError = onErrorFallback;
    } else if (typeof onEndOrOptions === 'object') {
      rate = onEndOrOptions.rate ?? 0.88;
      pitch = onEndOrOptions.pitch ?? 1.0;
      accent = onEndOrOptions.accent ?? 'US';
      onStart = onEndOrOptions.onStart;
      onEnd = onEndOrOptions.onEnd;
      onError = onEndOrOptions.onError;
    }

    const selectedVoice = getBestEnglishVoice(accent);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      // Ignore canceled errors when interrupting
      if (e.error === 'canceled' || e.error === 'interrupted') {
        if (onEnd) onEnd();
        return;
      }
      console.warn('Speech synthesis utterance warning:', e);
      if (onError) onError();
      else if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis initialization failed:', err);
    if (typeof onEndOrOptions === 'object' && onEndOrOptions.onError) {
      onEndOrOptions.onError(err);
    } else if (onErrorFallback) {
      onErrorFallback();
    }
    return false;
  }
}
