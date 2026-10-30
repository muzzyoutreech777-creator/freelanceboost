# FreelanceBoost 🚀
### Tech Guest Post Writing Helper & Upwork Proposal Writer

**FreelanceBoost** is a responsive single-page web app built specifically for new freelancers and technical writers pitching and writing guest posts for top developer publications (Smashing Magazine, CSS-Tricks, LogRocket Blog, Dev.to, freeCodeCamp, etc.) and bidding on freelance platforms like Upwork and Freelancer.

Designed with **zero backend**, full client-side execution, and seamless deployment on **GitHub Pages**.

---

## ✨ Features

### 📝 Tab 1: Article Helper
- **Custom Inputs**:
  - Article Topic / Working Title
  - Target Website / Niche (with quick presets for top dev blogs)
  - Word Count Target (presets from 800w tutorial to 2,000w pillar)
  - Target SEO Keyword
  - **"Your own experience or opinion on this topic"**: The essential element that tech blog editors demand. Infuses personal debugging war stories, benchmarks, and authentic human opinions.
- **Workflow & Output**:
  - **1. Clear Outline First**: 3 publication-ready title options, target audience breakdown, structured H2/H3 sections with word distribution budgets, and designated spots for personal stories.
  - **2. Full Draft**: Complete Markdown guide with realistic code blocks, avoiding AI clichés ("In today's fast-paced world...", "Delve into...", "Testament to..."), written in a natural developer-to-developer conversational tone.
- **Pre-Submission Quality & Ethics Checklist**:
  - Interactive verification of 6 critical criteria before submitting:
    1. ✅ Original ideas added
    2. ✅ Facts verified (framework versions & benchmarks checked)
    3. ✅ Sources linked (official docs & author references)
    4. ✅ No copied text
    5. ✅ Reads naturally (read-aloud cadence test)
    6. ✅ Follows publication guidelines
- **"Rewrite in My Voice" Box**:
  - Paste your own edits or personal writing samples.
  - Choose voice personas: *Dev Advocate (Punchy & Witty)*, *Staff Engineer (Nuanced & Arch)*, *Friendly Mentor (Conversational)*, *Concise & Direct (Zero Fluff)*, or *Custom Voice*.
  - Re-shapes sentence cadence while keeping technical facts and code intact.

---

### 💼 Tab 2: Proposal Writer
- **Inputs**:
  - Job description (pasted from Upwork, Freelancer, ProBlogger, etc.)
  - Freelancer's verified skills & specialties
  - 2 Past work samples (Real URLs + Article focus)
  - Freelancer's name
- **Outputs 3 Short Proposals (Strictly Under 150 Words Each)**:
  - **Version 1: Direct Problem Solver** (Hook on their specific bottleneck + directly cited sample + punchy CTA)
  - **Version 2: Strategic Tech Outline Teaser** (Offers an immediate angle/outline idea + targeted project question)
  - **Version 3: Rapid Turnaround Collaborator** (Smooth conversational workflow tone + reference to sample + next step)
- **Strict Anti-Hallucination Rule**:
  - **Never uses fake claims, fabricated experience, or invented metrics.**
  - Exclusively references the skills and work sample links entered by the user.
- **In-place Editor & Word Counter**:
  - Live word count counter ensuring every pitch remains strictly under the 150-word sweet spot.
  - Direct in-place editing before one-click copy.

---

### ✨ Tab 3: Edit & Polish
- **Direct Draft Pasting**: Paste any article draft or section you wrote.
- **Tone Selector**: Choose between **Simple** (plain English), **Professional** (authoritative, publication-ready), or **Friendly** (conversational, developer-to-developer).
- **Output 1: Corrected Grammar & Spelling**:
  - Fixes objective grammatical, punctuation, typo, and spelling mistakes while strictly preserving your original phrasing, vocabulary, and authorial style.
- **Output 2: Actionable Editorial Suggestions (Never Auto-Replaced)**:
  - Identifies unclear phrasing, repeated words, overly long/run-on sentences, and passive voice.
  - Interactive **Accept** (applies fix into working draft) or **Reject** buttons for each item.
- **Readability Diagnostics & Simple Tips**:
  - Flesch Reading Ease score (0–100), grade level estimate, words, sentences, and average words per sentence.
  - Actionable, practical tips tailored to your specific draft.
- **"Make It More Yours" Panel**:
  - Prompts you for:
    1. One personal example / debugging anecdote
    2. One strong opinion or contrarian stance
    3. One real benchmark or metric data point
  - Weaves these three anchors smoothly into your draft to make it distinctive and authentic.
- **Instant Copy Buttons**: One-click copy for the corrected draft, the suggestions breakdown, and the personalized draft.
- *Editorial Integrity*: Focuses on clarity, readability, and authentic author voice without making claims about bypassing AI detectors.

---

## 🔒 Security & Privacy: Client-Side API Key

- Powered by the **Gemini API** (`gemini-2.5-flash` or custom model).
- The user's API key is entered in the Settings modal and stored **exclusively in the browser's `localStorage`**.
- Zero backend servers, proxies, or telemetry intercept your key.
- Direct client-side calls to `https://generativelanguage.googleapis.com/v1beta/models/...`.
- If you don't have a Gemini API key yet, get a free one in 30 seconds at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🚀 How to Deploy on GitHub Pages

Because FreelanceBoost is a 100% client-side SPA with no backend dependencies, it can be deployed to GitHub Pages completely free in minutes.

### Method 1: Automated GitHub Actions (Recommended)

1. Push this repository to GitHub.
2. In your repo root, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy FreelanceBoost to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi

      - name: Build static bundle
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. In your GitHub repository:
   - Go to **Settings > Pages**
   - Under **Build and deployment > Source**, select **GitHub Actions**
4. Push to `main` — GitHub Actions will automatically build and deploy your app to `https://<your-username>.github.io/<repo-name>/`.

---

### Method 2: Manual Deploy via `gh-pages`

1. Build the production static bundle:
```bash
npm run build
```

2. Publish the `dist` folder using the `gh-pages` CLI:
```bash
npx gh-pages -d dist
```

3. In your GitHub repo:
   - Go to **Settings > Pages**
   - Under **Branch**, select `gh-pages` and `/ (root)` folder
   - Click **Save**

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Build for production (outputs static files to dist/)
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🎨 Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans + JetBrains Mono
- **Icons**: Lucide React
- **Bundler**: Vite 8 (configured with `base: './'` for seamless relative path resolution on any GitHub Pages subpath)
- **AI Engine**: Google Gemini API via client-side REST endpoint
