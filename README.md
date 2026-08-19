# Words of the Day — Advanced C1/C2 Professional English

A responsive, single-page application tailored for advanced English learners (IELTS 6.5–8.5 / CEFR C1–C2 / VSTEP C1) focusing on specialized industry vocabulary, executive idioms, pronunciation, Latin/Greek etymological roots, and interactive practice.

## Features
- **Daily Focus Vocabulary**: Dynamic selection of 5 advanced specialized vocabulary items & idioms across 8 professional domains.
- **Etymology & Morphological Roots**: Latin/Greek root analysis to help learners infer meanings of new vocabulary families.
- **Quote of the Day**: High-contrast thought leader banner with pronunciation playback.
- **Interactive Practice**: Sentence completion quizzes and interactive flashcards.
- **Complete Vocabulary Bank Drawer**: Full searchable glossary with domain filters.
- **Local Persistence**: Bookmark and save words locally.

## Deployment to GitHub Pages

This repository is pre-configured with a relative base path and a GitHub Actions workflow for automatic GitHub Pages deployment.

### Quick Setup:
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` (or trigger the **Deploy to GitHub Pages** workflow manually under the **Actions** tab).
4. Your site will be published at `https://<your-username>.github.io/<repo-name>/`.

### Local Development:
```bash
npm install
npm run dev
```

### Production Build:
```bash
npm run build
```
