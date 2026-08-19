import { WordItem, AcademicExample } from '../types';

/**
 * Academic context categories matching IELTS Task 2, Task 1, Speaking Part 3, and Executive Discourse
 */
export interface ContextScenario {
  badge: string;
  badgeColor: string;
  category: string;
  sentence: string;
  collocationHighlight?: string;
  syntacticNote?: string;
}

/**
 * Generates 3 rich context-aware academic sentences strictly adhering to CEFR C1/C2 & IELTS Band 8.0-9.0 writing criteria.
 */
export function getThreeContextAwareExamples(item: WordItem): ContextScenario[] {
  // If the word already has predefined academic examples or 3 examples
  const ex = item.examples || [];

  const example1 = ex[0] || `The deliberate application of ${item.word.toLowerCase()} is increasingly cited in academic literature as a decisive determinant of systemic institutional reform.`;
  const example2 = ex[1] || `In high-stakes corporate governance, executives who neglect ${item.word.toLowerCase()} risk catastrophic misalignment with emerging regulatory mandates.`;
  const example3 = ex[2] || `When scrutinizing contemporary socio-economic trends, empirical researchers argue that ${item.word.toLowerCase()} fundamentally alters long-standing behavioral paradigms.`;

  return [
    {
      badge: 'IELTS Writing Task 2',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      category: 'Academic Essay / Policy & Society',
      sentence: example1,
      syntacticNote: 'Complex complex-compound sentence demonstrating high grammatical range and accuracy.',
    },
    {
      badge: 'Executive Strategy',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      category: 'Corporate Decision-Making & Governance',
      sentence: example2,
      syntacticNote: 'Professional register suitable for formal executive summaries and analytical case studies.',
    },
    {
      badge: 'Academic Discourse',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      category: 'IELTS Speaking Part 3 / Critical Evaluation',
      sentence: example3,
      syntacticNote: 'Nuanced argumentative structure conveying sophisticated theoretical evaluation.',
    },
  ];
}

/**
 * Generates alternative context-aware academic sentences on demand for dynamic study
 */
export function fetchAlternativeAcademicScenarios(item: WordItem): ContextScenario[] {
  const w = item.word.toLowerCase();
  
  return [
    {
      badge: 'IELTS Essay: Global Economy',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      category: 'Economic Globalization & Fiscal Policy',
      sentence: `It is widely contended by leading macroeconomic analysts that integrating ${w} into international trade frameworks fosters resilience against market volatility.`,
      syntacticNote: 'Passive reporting clause ("It is widely contended...") favored in Band 8.5+ thesis development.',
    },
    {
      badge: 'IELTS Essay: Science & Tech',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      category: 'Technological Disruption & Ethical Governance',
      sentence: `Unless governments implement stringent ethical boundaries, the unbridled expansion of ${w} may inadvertently exacerbate existing socio-economic disparities.`,
      syntacticNote: 'Conditional inversion with high-level cohesive discourse marker ("Unless... inadvertently exacerbate").',
    },
    {
      badge: 'IELTS Speaking Part 3',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
      category: 'Philosophical & Critical Debate',
      sentence: `From a socio-cultural vantage point, the manifestation of ${w} highlights a fundamental shift in how modern communities negotiate collective responsibilities.`,
      syntacticNote: 'Expressive lexical framing ("From a socio-cultural vantage point...") demonstrating natural fluency.',
    },
  ];
}
