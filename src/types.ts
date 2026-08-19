export type IndustryType =
  | 'Business & Strategy'
  | 'FinTech & Banking'
  | 'Corporate Law & Governance'
  | 'Tech & Data Science'
  | 'Marketing & Growth'
  | 'Medicine & BioTech'
  | 'Leadership & Negotiation'
  | 'Sustainability & ESG';

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
  examples: [string, string];
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
