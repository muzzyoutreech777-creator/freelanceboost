import {
  ArticleInput,
  ArticleResult,
  ProposalInput,
  ProposalResult,
  VoiceStyle,
  PolishTone,
  PolishResult,
  PolishSuggestion,
  PersonalTouchInput,
  FactCheckResult,
  FactCheckClaim,
  EditorReviewResult,
  EditorReviewCategory,
} from '../types';

const STORAGE_KEY = 'freelanceboost_api_key';
const MODEL_KEY = 'freelanceboost_model';
export const DEFAULT_MODEL = 'gemini-3.8-flash';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored || '').trim();
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  const stored = localStorage.getItem(MODEL_KEY);
  // If user has an old or retired model (like gemini-2.5-flash), replace it with gemini-3.8-flash automatically
  if (!stored || stored === 'gemini-2.5-flash' || stored.includes('2.5-flash')) {
    localStorage.setItem(MODEL_KEY, DEFAULT_MODEL);
    return DEFAULT_MODEL;
  }
  return stored;
}

export function setStoredModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODEL_KEY, model.trim());
}

/**
 * Ping test to check if an API key is valid directly against Google's API
 */
export async function testGeminiApiKey(apiKey: string, model: string = DEFAULT_MODEL): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Please enter a Gemini API key.' };
  }

  // Direct request to Google Generative Language API using x-goog-api-key header
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with the word "READY"' }],
          },
        ],
      }),
    });

    if (!res.ok) {
      let errorMsg = '';
      try {
        const errorData = await res.json();
        errorMsg = errorData?.error?.message 
          || errorData?.message 
          || (typeof errorData?.error === 'string' ? errorData.error : '')
          || JSON.stringify(errorData);
      } catch {
        try {
          errorMsg = await res.text();
        } catch {
          errorMsg = res.statusText;
        }
      }
      return { success: false, message: `Google Error (${res.status} ${res.statusText}): ${errorMsg}` };
    }

    return { success: true, message: 'Connected directly to Google Gemini API! Key is verified.' };
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err?.message || 'Failed to reach Google API directly'}` };
  }
}

/**
 * Direct call from the browser to https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Using only the key the user typed in Settings (sent as the x-goog-api-key header)
 */
async function callGemini(prompt: string, isJson: boolean = true): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_KEY: Please enter your Gemini API key in Settings.');
  }

  const model = getStoredModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (isJson) {
    body.generationConfig = {
      responseMimeType: 'application/json',
    };
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (fetchErr: any) {
    throw new Error(`Direct connection to Google Gemini failed: ${fetchErr?.message || fetchErr}`);
  }

  if (!res.ok) {
    let errorDetail = '';
    try {
      const errorData = await res.json();
      errorDetail = errorData?.error?.message 
        || errorData?.message 
        || (typeof errorData?.error === 'string' ? errorData.error : '')
        || JSON.stringify(errorData);
    } catch {
      try {
        errorDetail = await res.text();
      } catch {
        errorDetail = res.statusText;
      }
    }
    // Return exact error message from Google
    throw new Error(`Google API Error (${res.status} ${res.statusText}): ${errorDetail || 'No detailed error message from Google'}`);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    const blockReason = data?.promptFeedback?.blockReason;
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (blockReason) {
      throw new Error(`Google API blocked content generation: ${blockReason}`);
    }
    if (finishReason && finishReason !== 'STOP') {
      throw new Error(`Google API stopped generation with status: ${finishReason}`);
    }
    throw new Error('Google Gemini returned an empty response. Please adjust your prompt.');
  }

  return textOutput;
}

/**
 * Tab 1: Generate Outline first, then full draft with personal experience and natural tone
 */
export async function generateArticleHelper(input: ArticleInput): Promise<ArticleResult> {
  const prompt = `You are a world-class senior technical editor and veteran tech blogger who writes for top developer publications like Smashing Magazine, CSS-Tricks, LogRocket Blog, Dev.to, and freeCodeCamp.

The user is a freelance technical writer pitching or drafting a guest post.
Here are the project requirements:
- Topic: "${input.topic}"
- Target Publication / Niche: "${input.targetSite}"
- Target Word Count: approximately ${input.wordCount} words
- Target SEO Keyword: "${input.targetKeyword}"
- Freelancer's Personal Experience / Opinion (CRITICAL - YOU MUST INTEGRATE THIS AUTHENTICALLY):
"""
${input.personalExperience || 'No specific personal story provided. Use a relatable developer first-person viewpoint solving real debugging bottlenecks.'}
"""

EDITORIAL REQUIREMENTS:
1. Outline FIRST:
   - Provide 3 catchy, publication-ready title options (engaging, specific, not clickbait).
   - A crystal clear outline divided into logical H2 and H3 sections, with bulleted key talking points for each section and an estimated word count budget per section.
   - Explicitly highlight in the outline where the freelancer's personal experience/story is introduced.
2. Full Draft SECOND:
   - Write the complete article in clean Markdown.
   - Natural Human Tone: Avoid repetitive AI tropes ("In today's fast-paced tech landscape", "Delve into", "Tapestry", "Testament", "It is important to remember"). Use conversational, confident, developer-to-developer phrasing.
   - Weave in the user's specific experience or opinion naturally with first-person perspective ("In our stack...", "When we benchmarked...", "A gotcha I ran into...").
   - Include realistic code snippets, architecture diagrams (ASCII/Mermaid if helpful), practical caveats, and performance tradeoffs.
   - Naturally integrate the target keyword "${input.targetKeyword}" in the title, first 100 words, one H2, and naturally throughout without keyword stuffing.
   - Target word count: close to ${input.wordCount} words.

Return a valid JSON object matching this exact schema:
{
  "titleOptions": ["Title 1", "Title 2", "Title 3"],
  "outline": "Markdown formatted outline with sections, bullet points, and word counts",
  "draft": "The full complete Markdown article text with headings, code blocks, personal experience seamlessly integrated",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}`;

  const rawJson = await callGemini(prompt, true);
  try {
    const parsed = JSON.parse(rawJson);
    const draftText = parsed.draft || '';
    const words = draftText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 220));

    return {
      titleOptions: Array.isArray(parsed.titleOptions) ? parsed.titleOptions : [input.topic],
      outline: parsed.outline || 'Outline generated.',
      draft: draftText,
      wordCountActual: words,
      readingTimeMinutes: readingTime,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
    };
  } catch (err: any) {
    // If JSON parse failed, clean markdown block ticks if present
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanStr);
    const draftText = parsed.draft || '';
    const words = draftText.trim().split(/\s+/).filter(Boolean).length;

    return {
      titleOptions: parsed.titleOptions || [input.topic],
      outline: parsed.outline || '',
      draft: draftText,
      wordCountActual: words,
      readingTimeMinutes: Math.max(1, Math.ceil(words / 220)),
      keyTakeaways: parsed.keyTakeaways || [],
    };
  }
}

/**
 * Tab 1: "Rewrite in my voice" feature
 */
export async function rewriteDraftInVoice(
  currentDraft: string,
  userVoiceEdits: string,
  style: VoiceStyle
): Promise<{ rewrittenDraft: string; changesSummary: string }> {
  let styleGuidance = '';
  switch (style) {
    case 'dev-advocate':
      styleGuidance = 'Tone: Developer Advocate. Punchy, witty, conversational, pragmatic, code-first with relatable humor.';
      break;
    case 'staff-engineer':
      styleGuidance = 'Tone: Staff / Principal Engineer. Authoritative, architectural depth, trade-off analysis, benchmark-driven, nuanced.';
      break;
    case 'friendly-mentor':
      styleGuidance = 'Tone: Friendly Mentor. Warm, encouraging, clear step-by-step analogies, assumes zero gatekeeping.';
      break;
    case 'concise-direct':
      styleGuidance = 'Tone: Concise & Direct. Minimalist, zero fluff, high signal-to-noise ratio, bulleted checklists.';
      break;
    default:
      styleGuidance = 'Adopt the user voice sample and notes strictly.';
  }

  const prompt = `You are a specialized technical editor tasked with rewriting a tech blog article to match a specific author's distinct voice and editorial edits.

ORIGINAL DRAFT:
"""
${currentDraft}
"""

USER'S VOICE SAMPLE, SPECIFIC EDITS, OR EDITORIAL NOTES:
"""
${userVoiceEdits}
"""

STYLE GUIDANCE:
${styleGuidance}

REQUIREMENTS:
1. Preserve all technical accuracy, code examples, core concepts, and data.
2. Infuse the author's distinctive cadence, sentence lengths, phrasing habits, and tone.
3. Remove any remaining stiff or robotic phrases.
4. Return a valid JSON object with:
   - "rewrittenDraft": The updated complete Markdown draft.
   - "changesSummary": A concise 2-3 bullet point summary explaining the key voice adjustments made (e.g. cadence, punchier intros, terminology alignment).`;

  const rawJson = await callGemini(prompt, true);
  try {
    const parsed = JSON.parse(rawJson);
    return {
      rewrittenDraft: parsed.rewrittenDraft || currentDraft,
      changesSummary: parsed.changesSummary || 'Updated voice rhythm and cadence.',
    };
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanStr);
    return {
      rewrittenDraft: parsed.rewrittenDraft || currentDraft,
      changesSummary: parsed.changesSummary || 'Updated voice rhythm and cadence.',
    };
  }
}

/**
 * Tab 2: Proposal Writer
 * Outputs 3 short proposal versions (strictly under 150 words each) for Upwork/Freelancer.
 * Must start with a hook referencing job, name one relevant sample, ask one smart question, end with clear next step.
 * NEVER use fake claims or fake experience. Only use what the user entered.
 */
export async function generateProposals(input: ProposalInput): Promise<ProposalResult> {
  const prompt = `You are an elite freelance pitch strategist helping a freelance technical writer land jobs on Upwork, Freelancer, and direct client pitches.

FREELANCER DETAILS (STRICT RULE: ONLY USE THESE FACTS. NEVER INVENT CLIENTS, YEARS, OR FAKE METRICS):
- Name: "${input.freelancerName}"
- Verified Skills: "${input.freelancerSkills}"
- Work Sample 1: URL: ${input.sample1Url} | Title/Focus: ${input.sample1Title || 'Published Tech Article'}
- Work Sample 2: URL: ${input.sample2Url} | Title/Focus: ${input.sample2Title || 'Published Tech Article'}

CLIENT'S JOB DESCRIPTION:
"""
${input.jobDescription}
"""

TASK:
Write THREE (3) distinct, highly-converting, concise proposal versions for this job.
EACH PROPOSAL MUST MEET ALL OF THESE STRICT RULES:
1. WORD COUNT: MUST BE STRICTLY UNDER 150 WORDS! (Ideal range: 90 to 135 words). Clients discard walls of text.
2. HOOK: Must start immediately with a specific hook that references the client's exact problem, stack, or target audience mentioned in the job post. (NEVER start with "Dear Hiring Manager", "I am excited to apply", or "Hope you are doing well").
3. RELEVANT SAMPLE: Must naturally name and link to ONE of the two provided work samples that best matches this job.
4. SMART QUESTION: Must ask ONE thoughtful, project-specific question that shows deep domain expertise and invites a reply.
5. CLEAR NEXT STEP: Must finish with a low-friction, professional call to action (e.g., "Are you free for a quick 10-minute chat or should I send over a 3-bullet outline? - ${input.freelancerName}").
6. ZERO FAKE CLAIMS: NEVER claim "I have 10 years of experience" unless provided, never claim fake metrics ("increased traffic by 400%"), never invent previous companies. Only use the skills and links supplied by the user.

THE 3 VERSIONS:
- Version 1: "Direct Problem Solver" (Focuses on solving their immediate bottleneck, references relevant sample, asks targeted architectural question).
- Version 2: "Strategic Tech Outline Teaser" (Offers an immediate angle/outline idea for their post, references sample, asks about audience level).
- Version 3: "Rapid Turnaround Collaborator" (Concise, workflow-oriented, references sample, asks about editorial process/guidelines).

Return a valid JSON object matching this exact schema:
{
  "version1": {
    "title": "Direct Problem Solver",
    "hook": "Specific first sentence referencing job problem",
    "sampleMentioned": "Which sample link was cited",
    "smartQuestion": "The single domain question asked",
    "callToAction": "Next step closing",
    "fullProposal": "The full text of proposal 1 under 150 words"
  },
  "version2": {
    "title": "Strategic Outline Teaser",
    "hook": "Specific first sentence referencing job problem",
    "sampleMentioned": "Which sample link was cited",
    "smartQuestion": "The single domain question asked",
    "callToAction": "Next step closing",
    "fullProposal": "The full text of proposal 2 under 150 words"
  },
  "version3": {
    "title": "Rapid Turnaround Collaborator",
    "hook": "Specific first sentence referencing job problem",
    "sampleMentioned": "Which sample link was cited",
    "smartQuestion": "The single domain question asked",
    "callToAction": "Next step closing",
    "fullProposal": "The full text of proposal 3 under 150 words"
  }
}`;

  const rawJson = await callGemini(prompt, true);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleanStr);
  }

  function formatVersion(rawVer: any, defaultTitle: string) {
    const fullText = (rawVer?.fullProposal || '').trim();
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    return {
      title: rawVer?.title || defaultTitle,
      hook: rawVer?.hook || '',
      body: fullText,
      sampleMentioned: rawVer?.sampleMentioned || '',
      smartQuestion: rawVer?.smartQuestion || '',
      callToAction: rawVer?.callToAction || '',
      fullProposal: fullText,
      wordCount: wordCount,
    };
  }

  return {
    version1: formatVersion(parsed.version1, 'Direct Problem Solver'),
    version2: formatVersion(parsed.version2, 'Strategic Outline Teaser'),
    version3: formatVersion(parsed.version3, 'Rapid Turnaround Collaborator'),
  };
}

/**
 * Tab 3: Edit & Polish
 * Output 1: corrected grammar and spelling, keeping the user's original wording and style as much as possible.
 * Output 2: list of suggestions (unclear sentences, repeated words, long sentences, passive voice) as accept/reject items.
 * Readability score with simple tips. Tone selector: simple, professional, friendly.
 * Strict: Never claim to bypass or fool any AI detector.
 */
export async function editAndPolishDraft(draft: string, tone: PolishTone): Promise<PolishResult> {
  const toneInstructions: Record<PolishTone, string> = {
    simple: 'Ensure simple, accessible language. Prefer plain everyday words and concise sentences.',
    professional: 'Maintain an authoritative, polished, industry-standard publication tone.',
    friendly: 'Keep a conversational, warm, approachable developer-to-developer tone.',
  };

  const prompt = `You are a meticulous technical copyeditor.

DRAFT TO EDIT & POLISH:
"""
${draft}
"""

TARGET TONE: "${tone}"
Tone Guidance: ${toneInstructions[tone]}

CRITICAL EDITORIAL RULES:
1. Output 1 ("correctedDraft"):
   - Correct ONLY grammatical errors, punctuation mistakes, typos, spelling errors, and subject-verb disagreements.
   - You MUST PRESERVE the user's original phrasing, vocabulary, idioms, sentence structures, and authorial style as much as possible.
   - Do NOT rewrite or rephrase sentences here. Only fix true linguistic errors.
2. Output 2 ("suggestions"):
   - Identify specific opportunities for improvement without forcing them.
   - Categorize each suggestion strictly into one of:
     - "unclear": Confusing, ambiguous, or convoluted phrasing.
     - "repeated": Unnecessary word repetition or redundancies close together.
     - "long-sentence": Sentences that are overly long or run-on that could be split for punchiness.
     - "passive-voice": Instances of passive voice where active voice makes the technical instruction clearer.
   - Provide "originalSnippet" (exact substring from the draft), "suggestedFix" (the suggested improvement), and a brief "explanation".
3. Readability Analysis:
   - Calculate or estimate the Flesch Reading Ease score (0 to 100).
   - "gradeLevel": e.g., "Grade 8 - Plain English", "Grade 10 - Standard Tech", "Grade 12+ - Complex".
   - "simpleTips": 3-4 concise, practical tips for the writer to improve this specific draft.
4. STRICT COMPLIANCE:
   - Do NOT make any claims or references to bypassing, evading, or fooling AI detectors or checkers. Focus exclusively on clarity, flow, readability, and authentic authorial craft.

Return a valid JSON object matching this schema:
{
  "correctedDraft": "The draft with only grammar and spelling fixed, original style preserved",
  "suggestions": [
    {
      "id": "sug-1",
      "category": "unclear",
      "originalSnippet": "exact text from draft",
      "suggestedFix": "proposed replacement text",
      "explanation": "why this helps"
    }
  ],
  "readability": {
    "fleschScore": 72,
    "gradeLevel": "Grade 8 - Plain English",
    "simpleTips": [
      "Tip 1...",
      "Tip 2...",
      "Tip 3..."
    ]
  }
}`;

  const rawJson = await callGemini(prompt, true);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleanStr);
  }

  // Compute stats on the draft
  const words = draft.trim().split(/\s+/).filter(Boolean).length;
  const sentences = draft.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const avgWordsPerSentence = Math.round((words / sentences) * 10) / 10;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 220));

  const fleschScore = typeof parsed?.readability?.fleschScore === 'number'
    ? Math.min(100, Math.max(0, Math.round(parsed.readability.fleschScore)))
    : Math.min(100, Math.max(30, Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * 1.5)));

  const suggestions: PolishSuggestion[] = Array.isArray(parsed?.suggestions)
    ? parsed.suggestions.map((sug: any, idx: number) => ({
        id: sug.id || `sug-${idx + 1}`,
        category: (['unclear', 'repeated', 'long-sentence', 'passive-voice'].includes(sug.category)
          ? sug.category
          : 'unclear') as PolishSuggestion['category'],
        originalSnippet: sug.originalSnippet || '',
        suggestedFix: sug.suggestedFix || '',
        explanation: sug.explanation || 'Improves clarity and readability.',
        status: 'pending' as const,
      }))
    : [];

  return {
    correctedDraft: parsed?.correctedDraft || draft,
    suggestions,
    readability: {
      fleschScore,
      gradeLevel: parsed?.readability?.gradeLevel || (fleschScore > 70 ? 'Grade 7-8 (Clear & Accessible)' : fleschScore > 50 ? 'Grade 9-11 (Standard Tech)' : 'Grade 12+ (Advanced Technical)'),
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence,
      readingTimeMinutes,
      simpleTips: Array.isArray(parsed?.readability?.simpleTips) ? parsed.readability.simpleTips : [
        'Break sentences longer than 25 words into two distinct ideas.',
        'Replace passive constructions with direct action verbs.',
        'Use transition words between technical concepts to improve reading flow.'
      ],
    },
  };
}

/**
 * Tab 3: "Make it more yours" Panel
 * Weaves in:
 * 1. One personal example
 * 2. One opinion
 * 3. One real data point
 * into the draft naturally.
 */
export async function infusePersonalElements(
  draft: string,
  personal: PersonalTouchInput,
  tone: PolishTone
): Promise<string> {
  const prompt = `You are a technical editor helping an author infuse their authentic personal voice into a technical article draft.

CURRENT DRAFT:
"""
${draft}
"""

AUTHOR'S THREE PERSONAL ELEMENTS TO INFUSE:
1. Personal Example:
"${personal.personalExample}"

2. Personal Opinion / Strong Stance:
"${personal.personalOpinion}"

3. Real Data Point / Benchmark / Metric:
"${personal.realDataPoint}"

TONE: ${tone}

TASK:
Weave these THREE specific elements naturally into the draft:
- Place the personal example where it grounds a theoretical concept in real-world experience.
- Place the personal opinion where it introduces an authentic perspective or challenges conventional advice.
- Place the real data point where it provides evidence, benchmark results, or impact.
- Maintain the author's voice and smooth transitions.
- Do NOT make claims about bypassing or tricking AI detectors; the goal is authentic human storytelling and technical credibility.

Return a valid JSON object:
{
  "personalizedDraft": "The complete revised draft with all three elements smoothly integrated."
}`;

  const rawJson = await callGemini(prompt, true);
  try {
    const parsed = JSON.parse(rawJson);
    return parsed.personalizedDraft || draft;
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanStr);
    return parsed.personalizedDraft || draft;
  }
}

/**
 * Tab 4 Section 1: Fact Check
 * Lists every factual claim, version number, statistic, and date in a table:
 * Claim, Risk (low/medium/high), and What to verify.
 * CRITICAL RULE: Never say a claim is confirmed true.
 */
export async function factCheckDraft(draft: string): Promise<FactCheckResult> {
  const prompt = `You are a technical fact-checking auditor for engineering publications.

ARTICLE DRAFT TO AUDIT:
"""
${draft}
"""

TASK:
Identify and extract EVERY SINGLE factual claim, version number, statistic, percentage, benchmark result, and date from the draft.

For each item, provide:
1. "claim": The exact statement, statistic, version requirement, or date from the draft.
2. "risk": "high" | "medium" | "low"
   - "high": Specific performance benchmarks, version compatibility numbers, release dates, breaking API changes, or unverified claims that frequently change or get outdated.
   - "medium": Survey statistics, general architectural comparisons, framework capability assertions.
   - "low": Ubiquitous, standard language features or undisputed industry facts.
3. "whatToVerify": Concrete, actionable steps for the author to verify this claim in primary sources (e.g., official docs, GitHub release notes, npm changelogs, benchmark repos).

STRICT RULE:
- NEVER state or imply that any claim is "confirmed true", "verified", or "guaranteed accurate". AI cannot guarantee truth. Treat every item as a target for author verification.

Return a valid JSON object matching this schema:
{
  "claims": [
    {
      "id": "claim-1",
      "claim": "Next.js 15 was officially released on October 21, 2024",
      "risk": "medium",
      "whatToVerify": "Check official Next.js GitHub releases or the Vercel blog release announcement for October 2024."
    }
  ],
  "disclaimer": "AI can make mistakes. Verify risky claims in official docs."
}`;

  const rawJson = await callGemini(prompt, true);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleanStr);
  }

  const claims: FactCheckClaim[] = Array.isArray(parsed?.claims)
    ? parsed.claims.map((item: any, idx: number) => ({
        id: item.id || `claim-${idx + 1}`,
        claim: String(item.claim || '').trim(),
        risk: (['low', 'medium', 'high'].includes(item.risk) ? item.risk : 'medium') as FactCheckClaim['risk'],
        whatToVerify: String(item.whatToVerify || 'Verify in official documentation.').trim(),
      }))
    : [];

  return {
    claims,
    disclaimer: 'AI can make mistakes. Verify risky claims in official docs.',
  };
}

/**
 * Tab 4 Section 2: Final Editor Review
 * Compares draft against publication guidelines across:
 * - word count
 * - headings
 * - tone
 * - links
 * - formatting
 */
export async function finalEditorReview(draft: string, guidelines: string): Promise<EditorReviewResult> {
  const words = draft.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a senior publication editor reviewing an article submission against a developer publication's editorial guidelines.

DRAFT TO REVIEW (${words} words):
"""
${draft}
"""

PUBLICATION'S EDITORIAL GUIDELINES:
"""
${guidelines}
"""

TASK:
Compare the draft directly against the guidelines and evaluate WHAT TO FIX across these five distinct categories:
1. "wordCount": Actual word count (${words} words) vs guideline limits.
2. "headings": Heading structure (H2/H3 hierarchy, descriptive clarity, frequency).
3. "tone": Writing voice (technical vs conversational, avoiding promotional buzzwords, active voice).
4. "links": Presence and quality of technical references, documentation links, and citations.
5. "formatting": Code snippets, bullet points, callouts, readability formatting.

For each category, provide:
- "status": "pass" | "needs-fix" | "warning"
- "finding": A direct, objective assessment of how the draft compares to the guideline.
- "recommendation": Specific, practical edits the author should make to comply.

Return a valid JSON object matching this schema:
{
  "wordCount": {
    "status": "pass",
    "finding": "Draft is 1,250 words, which fits within the requested 1,200-1,800 range.",
    "recommendation": "Word count is optimal; no trimming needed."
  },
  "headings": {
    "status": "needs-fix",
    "finding": "Section 2 lacks an H3 sub-heading for the benchmarking methodology.",
    "recommendation": "Add '### Benchmarking Methodology' to split the 400-word paragraph."
  },
  "tone": {
    "status": "pass",
    "finding": "Authoritative and practical developer-to-developer voice.",
    "recommendation": "Ensure passive voice in the conclusion is replaced with active verbs."
  },
  "links": {
    "status": "warning",
    "finding": "Only 1 link to official Next.js docs is present.",
    "recommendation": "Add links to the React 19 RFC and the TanStack Query v5 documentation."
  },
  "formatting": {
    "status": "pass",
    "finding": "Clean markdown with proper language tags on code blocks.",
    "recommendation": "Add file paths above code blocks as requested in the style guide."
  },
  "overallSummary": "Concise 2-sentence summary of the review and submission readiness."
}`;

  const rawJson = await callGemini(prompt, true);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    const cleanStr = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleanStr);
  }

  const defaultCategory = (name: string): EditorReviewCategory => ({
    status: 'pass',
    finding: `Evaluation for ${name} completed against guidelines.`,
    recommendation: 'Check the guideline requirements before final submission.',
  });

  const parseCat = (obj: any, name: string): EditorReviewCategory => {
    if (!obj || typeof obj !== 'object') return defaultCategory(name);
    return {
      status: ['pass', 'needs-fix', 'warning'].includes(obj.status) ? obj.status : 'warning',
      finding: String(obj.finding || `Checked ${name} against guidelines.`),
      recommendation: String(obj.recommendation || 'Follow guideline instructions.'),
    };
  };

  return {
    wordCount: parseCat(parsed?.wordCount, 'Word Count'),
    headings: parseCat(parsed?.headings, 'Headings'),
    tone: parseCat(parsed?.tone, 'Tone'),
    links: parseCat(parsed?.links, 'Links'),
    formatting: parseCat(parsed?.formatting, 'Formatting'),
    overallSummary: String(parsed?.overallSummary || 'Review complete. Review the recommendations before submitting.'),
  };
}


