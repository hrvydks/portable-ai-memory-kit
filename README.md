# Portable AI Memory Kit

A local-first web app for maintaining a portable memory pack that you can paste into ChatGPT, Claude, or Gemini. It keeps Canon (stable truths), Current State (active focus), and Deltas (changes over time) in your browser.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. In Vercel, choose **New Project** → **Import Git Repository**.
3. Accept the defaults (Next.js is detected automatically).
4. Deploy.

## Architecture notes

- **Local-first storage**: Data is stored in IndexedDB when available, with a localStorage fallback so data remains in the browser even without IndexedDB support.
- **Autosave**: Canon and Current State are saved automatically with a short debounce to reduce accidental loss.
- **Export/Import**: Settings allows JSON exports, validated imports (merge or replace), and a Markdown bundle for quick sharing.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — run ESLint
