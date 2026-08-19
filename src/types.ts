export type IndustryType =
  | 'Business & Strategy'
  | 'FinTech & Banking'
  | 'Corporate Law & Governance'
  | 'Tech & Data Science'
  | 'Marketing & Growth'
  | 'Medicine & BioTech'
  | 'Leadership & Negotiation'
  | 'Sustainability & ESG';

export interface AcademicExample {
  context: string; // e.g. "IELTS Writing Task 2 (Argumentative)", "Executive & Corporate Strategy", "IELTS Academic Analysis"
  sentence: string;
  analysis?: string; // Brief note on collocations or syntactic structure
}

export interface WordItem {
  id: string;
  word: string;
  ipa: string;
  type: string; // e.g. "Noun", "Verb", "Adjective", "Idiom / Verb phrase", etc.
  industry: IndustryType;
  level: 'C1' | 'C2';
  definition: string;
  collocations?: string[];
  synonyms?: string[];
  examples: string[]; // 3 context-aware C1/C2 sentences
  academicExamples?: AcademicExample[];
  etymology?: string; // Latin / Greek root breakdown
  imageUrl: string; // Visual illustration depicting the concept
  imageCaption?: string; // Caption explaining the visual metaphor
  ieltsBandContext?: string; // e.g., "High-scoring in IELTS Speaking Part 3 & Writing Task 2"
}

export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  context: string;
  imageUrl: string;
  imageKeyword: string;
}

export interface QuizQuestion {
  id: string;
  targetWord: string;
  sentenceWithBlank: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // "YYYY-MM-DD"
  completedDates: string[]; // array of "YYYY-MM-DD" strings
}

export interface LearnedWordMeta {
  wordId: string;
  learnedAt: string; // "YYYY-MM-DD"
  daysAgo?: number;
  lastReviewedAt?: string;
  reviewCount?: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: 'Flame' | 'Trophy' | 'Target' | 'Brain' | 'Sparkles' | 'BookOpen' | 'Volume2' | 'Award';
  category: 'streak' | 'mastery' | 'quiz' | 'review';
  isUnlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  maxProgress: number;
  accentColor: string; // e.g., 'amber', 'emerald', 'indigo', 'rose', 'purple'
}
