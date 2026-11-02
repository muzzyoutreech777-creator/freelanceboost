export interface ArticleInput {
  topic: string;
  targetSite: string;
  wordCount: number;
  targetKeyword: string;
  personalExperience: string;
}

export interface ArticleResult {
  titleOptions: string[];
  outline: string;
  draft: string;
  wordCountActual: number;
  readingTimeMinutes: number;
  keyTakeaways: string[];
}

export interface ProposalInput {
  jobDescription: string;
  freelancerSkills: string;
  sample1Url: string;
  sample1Title: string;
  sample2Url: string;
  sample2Title: string;
  freelancerName: string;
}

export interface ProposalVersion {
  title: string;
  hook: string;
  body: string;
  sampleMentioned: string;
  smartQuestion: string;
  callToAction: string;
  fullProposal: string;
  wordCount: number;
}

export interface ProposalResult {
  version1: ProposalVersion; // Direct Problem-Solver Hook
  version2: ProposalVersion; // Technical Outline & Value Teaser
  version3: ProposalVersion; // Rapid-Turnaround Collaborator
}

export interface QualityChecklist {
  originalIdeas: boolean;
  factsVerified: boolean;
  sourcesLinked: boolean;
  noCopiedText: boolean;
  readsNaturally: boolean;
  followsGuidelines: boolean;
}

export type ActiveTab = 'article' | 'proposal' | 'polish' | 'quality';

export type VoiceStyle = 
  | 'custom'
  | 'dev-advocate'      // Punchy, witty, code-first, conversational
  | 'staff-engineer'   // Authoritative, architectural, trade-off focused
  | 'friendly-mentor'   // Warm, encouraging, clear analogies
  | 'concise-direct';   // Minimalist, high signal-to-noise ratio

export type PolishTone = 'simple' | 'professional' | 'friendly';

export type SuggestionCategory = 'unclear' | 'repeated' | 'long-sentence' | 'passive-voice';

export interface PolishSuggestion {
  id: string;
  category: SuggestionCategory;
  originalSnippet: string;
  suggestedFix: string;
  explanation: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ReadabilityMetrics {
  fleschScore: number;
  gradeLevel: string;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  readingTimeMinutes: number;
  simpleTips: string[];
}

export interface PersonalTouchInput {
  personalExample: string;
  personalOpinion: string;
  realDataPoint: string;
}

export interface PolishResult {
  correctedDraft: string;
  suggestions: PolishSuggestion[];
  readability: ReadabilityMetrics;
  personalizedDraft?: string;
}

export type ClaimRisk = 'low' | 'medium' | 'high';

export interface FactCheckClaim {
  id: string;
  claim: string;
  risk: ClaimRisk;
  whatToVerify: string;
}

export interface FactCheckResult {
  claims: FactCheckClaim[];
  disclaimer: string;
}

export interface EditorReviewCategory {
  status: 'pass' | 'needs-fix' | 'warning';
  finding: string;
  recommendation: string;
}

export interface EditorReviewResult {
  wordCount: EditorReviewCategory;
  headings: EditorReviewCategory;
  tone: EditorReviewCategory;
  links: EditorReviewCategory;
  formatting: EditorReviewCategory;
  overallSummary: string;
}
