import { ArticleInput, ProposalInput, PersonalTouchInput } from '../types';

export const SAMPLE_ARTICLE_INPUT: ArticleInput = {
  topic: 'Why We Replaced REST with tRPC in Our Next.js 15 App (And What Broke)',
  targetSite: 'Smashing Magazine (or LogRocket Blog)',
  wordCount: 1200,
  targetKeyword: 'tRPC Next.js 15 type safety',
  personalExperience: 'In our 4-person startup, API drift between frontend React and backend routes was causing 3-4 bugs every sprint. When we migrated to tRPC, we eliminated runtime schema validation errors overnight. But we hit a major gotcha with Server Components caching and bundling server code into client chunks. Sharing the exact workaround we used with server-only headers and TanStack Query v5.',
};

export const SAMPLE_PROPOSAL_INPUT: ProposalInput = {
  jobDescription: `Looking for an experienced technical writer to craft 3 deep-dive, practical tutorials about Next.js 15 and React Server Components for our developer blog.
Must include tested code snippets, clear architectural diagrams, and real-world performance benchmarks.
We value hands-on dev experience over generic SEO fluff. Please share 2 live published articles you wrote.`,
  freelancerSkills: 'Next.js 15, React 19, TypeScript, Technical Writing, Performance Profiling, DevRel Documentation',
  sample1Url: 'https://dev.to/alexfreelance/optimizing-nextjs-hydration-benchmarks-3k2a',
  sample1Title: 'Optimizing Next.js Hydration: Real-world Benchmarks',
  sample2Url: 'https://blog.logrocket.com/mastering-react-server-actions-best-practices/',
  sample2Title: 'Mastering React Server Actions & Mutation State',
  freelancerName: 'Alex Morgan',
};

export const SAMPLE_POLISH_DRAFT = `When building modern web applications, state management has always been one of the most trickiest problems developers face today. Many developers often struggle with choosing between Redux Toolkit, Zustand, or simple React context, and this decision is often made without considering the long term maintenance costs that might be incurred later on down the road.

In our recent project, a lot of performance bottlenecks were observed by the team during initial testing of our large interactive dashboard. The dashboard components was re-rendering unnecessarily whenever any small state update was dispatched. It is generally believed that global state should hold everything, but this is a very common mistake.

By refactoring our state architecture and splitting state into local component state and atomic server cache, significant speed improvements were achieved. Developers must carefully analyze their re-render cycles before reaching for complex global state libraries.`;

export const SAMPLE_PERSONAL_TOUCH: PersonalTouchInput = {
  personalExample: 'In sprint 14 of our analytics app, our modal component was triggering 48 redundant re-renders of the parent chart grid on every keystroke.',
  personalOpinion: 'Most teams reach for Redux far too early; 80% of apps only need URL search params and React Query for server cache.',
  realDataPoint: 'After shifting our filter state to URL params, our Lighthouse Interaction to Next Paint (INP) dropped from 380ms down to 42ms.',
};

export const DEFAULT_CHECKLIST = {
  originalIdeas: false,
  factsVerified: false,
  sourcesLinked: false,
  noCopiedText: false,
  readsNaturally: false,
  followsGuidelines: false,
};

export const CHECKLIST_ITEMS = [
  {
    id: 'originalIdeas',
    label: 'Original ideas added',
    description: 'Includes your personal experiences, contrarian opinions, or unique project insights that only you know.',
  },
  {
    id: 'factsVerified',
    label: 'Facts verified',
    description: 'Benchmarked claims, framework version numbers, and technical assertions are tested and accurate.',
  },
  {
    id: 'sourcesLinked',
    label: 'Sources linked',
    description: 'Direct links to official documentation, GitHub repositories, RFCs, and credited author references.',
  },
  {
    id: 'noCopiedText',
    label: 'No copied text',
    description: '100% original phrasing; passes plagiarism checks and respects original code author licensing.',
  },
  {
    id: 'readsNaturally',
    label: 'Reads naturally',
    description: 'Tested by reading aloud. Sentences have varied cadence, human warmth, and no synthetic AI cliches.',
  },
  {
    id: 'followsGuidelines',
    label: 'Follows site guidelines',
    description: 'Complies with target publication word count, formatting (headings, code blocks), and style rules.',
  },
] as const;

export const SAMPLE_FACT_CHECK_DRAFT = `Next.js 15 was officially released on October 21, 2024, introducing React 19 support and async request APIs. According to the 2024 State of React survey, over 68% of production React applications now use Next.js or Remix for server-side rendering.

When migrating our application from Next.js 14.2 to Next.js 15.0, fetch requests are no longer cached by default, which initially caused an 85% increase in origin database queries until we added explicit cache tags. Furthermore, Node.js 18.18 is now the minimum required runtime.

In our production testing across 12,000 requests, switching to Server Actions reduced client bundle size by 34kB (a 42% decrease) and improved our Time to First Byte (TTFB) to 140ms on Edge runtime.`;

export const SAMPLE_EDITORIAL_GUIDELINES = `1. Target Word Count: 1,200 to 1,800 words.
2. Headings: Use clear H2 and H3 markdown headings. Every major section should feature a code snippet or practical benchmark.
3. Tone: Authoritative, pragmatic, and developer-to-developer. Avoid hype, marketing buzzwords ("revolutionary", "game-changer"), and passive voice.
4. Links & Citations: Every statistical claim or version release must link directly to official documentation or source GitHub repositories. Minimum 3 outbound technical reference links.
5. Code Formatting: All TypeScript snippets must specify type annotations and file names above the block.`;

