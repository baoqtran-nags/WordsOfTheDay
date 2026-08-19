import { WordItem, QuizQuestion, LearnedWordMeta } from '../types';
import { getLocalDateString } from './streak';

const STORAGE_KEY_META = 'wotd_learned_meta';

/**
 * Calculates day difference between two "YYYY-MM-DD" dates
 */
export function getDaysDifference(pastDateStr: string, currentDateStr: string = getLocalDateString()): number {
  try {
    const p = new Date(pastDateStr + 'T00:00:00');
    const c = new Date(currentDateStr + 'T00:00:00');
    const diffTime = c.getTime() - p.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Returns a past date string "YYYY-MM-DD" subtracted by N days
 */
export function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Loads learned word metadata from localStorage, with default realistic seeding for long-term retention
 */
export function loadLearnedWordsMeta(learnedIds: string[]): Record<string, LearnedWordMeta> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY_META);
    let meta: Record<string, LearnedWordMeta> = raw ? JSON.parse(raw) : {};

    // Ensure all current learnedIds have a record
    const today = getLocalDateString();
    let hasChanges = false;

    // Default seed dates for initial demonstration: distribute across 1 to 5 days ago
    const seedDays = [4, 5, 3, 6, 4, 2, 5, 7, 3, 4];

    learnedIds.forEach((id, index) => {
      if (!meta[id]) {
        // Seed some to be 3+ days ago for instant spaced-repetition retention testing
        const daysAgo = seedDays[index % seedDays.length];
        meta[id] = {
          wordId: id,
          learnedAt: getPastDateString(daysAgo),
          reviewCount: 0,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    }

    return meta;
  } catch (e) {
    console.error('Failed to load learned words meta:', e);
    return {};
  }
}

/**
 * Saves or updates a word's learned metadata
 */
export function saveWordLearnedMeta(
  wordId: string,
  isLearned: boolean,
  currentMeta: Record<string, LearnedWordMeta>
): Record<string, LearnedWordMeta> {
  const updated = { ...currentMeta };

  if (isLearned) {
    if (!updated[wordId]) {
      updated[wordId] = {
        wordId,
        learnedAt: getLocalDateString(),
        reviewCount: 0,
      };
    }
  } else {
    delete updated[wordId];
  }

  try {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save learned words meta:', e);
  }

  return updated;
}

export interface ReviewCandidate {
  wordItem: WordItem;
  meta: LearnedWordMeta;
  daysSinceLearned: number;
}

/**
 * Retrieves all words marked as learned more than 3 days ago (≥ 3 days)
 */
export function getWordsDueForReview(
  learnedWordIds: string[],
  meta: Record<string, LearnedWordMeta>,
  vocabularyDb: WordItem[],
  minDaysThreshold: number = 3
): ReviewCandidate[] {
  const today = getLocalDateString();
  const candidates: ReviewCandidate[] = [];

  for (const id of learnedWordIds) {
    const item = vocabularyDb.find((w) => w.id === id);
    if (!item) continue;

    const itemMeta = meta[id] || { wordId: id, learnedAt: getPastDateString(4), reviewCount: 0 };
    const daysSince = getDaysDifference(itemMeta.learnedAt, today);

    if (daysSince >= minDaysThreshold) {
      candidates.push({
        wordItem: item,
        meta: itemMeta,
        daysSinceLearned: daysSince,
      });
    }
  }

  // Sort by oldest learned first to maximize spaced repetition efficiency
  return candidates.sort((a, b) => b.daysSinceLearned - a.daysSinceLearned);
}

/**
 * Builds high-yield multiple-choice review questions based on the candidate words
 */
export function generateReviewQuiz(candidates: ReviewCandidate[], vocabularyDb: WordItem[]): QuizQuestion[] {
  const targetWords = candidates.map((c) => c.wordItem);
  if (targetWords.length === 0) return [];

  // Shuffle candidates and pick up to 5-10 questions
  const shuffledTargets = [...targetWords].sort(() => Math.random() - 0.5);

  return shuffledTargets.map((target, idx) => {
    // Generate options: 1 correct + 3 distractor words
    const distractors = vocabularyDb
      .filter((w) => w.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.word);

    const options = [target.word, ...distractors].sort(() => Math.random() - 0.5);

    // Pick example sentence 0 or 1, and blank out the target word
    const rawSentence = target.examples && target.examples.length > 0 ? target.examples[0] : target.definition;
    const searchRoot = target.word.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const regex = new RegExp(`(${target.word}|${searchRoot}[a-z]*)`, 'gi');
    const sentenceWithBlank = rawSentence.replace(regex, '__________');

    return {
      id: `review_q_${target.id}_${idx}`,
      targetWord: target.word,
      sentenceWithBlank: sentenceWithBlank.includes('__________')
        ? sentenceWithBlank
        : `Definition: "${target.definition}" — Identify the correct term: __________`,
      correctAnswer: target.word,
      options,
      explanation: `${target.word} (${target.ipa}) [${target.type}]: ${target.definition}. Origin: ${target.etymology || 'Latin/Greek classical root'}.`,
    };
  });
}
