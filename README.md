# HCI Diary Study

A local-first web app for a 7-day diary study on everyday AI-agent failures and expectations of contextual intelligence. Data is stored in the browser (`localStorage`) only — no server or database.

**Live site (after deployment):** https://soniasuns.github.io/storytelling-pilot/

## What it does

- Participant setup and multi-participant support on one device
- Daily check-ins over 7 days
- Detailed incident reports
- Study progress overview
- Export data as JSON
- Works offline after first load (static assets)

## Local development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173/storytelling-pilot/`).

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo is configured for **GitHub Actions** deployment (recommended for Vite/React).

1. Push this project to GitHub (repository name: `storytelling-pilot`).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to the `main` branch — the workflow in `.github/workflows/deploy.yml` builds and deploys `dist/`.

The site will be available at:

`https://<username>.github.io/storytelling-pilot/`

### Change the base path

If you rename the repository, update **one line** in `vite.config.js`:

```js
const GITHUB_PAGES_BASE = '/your-repo-name/'
```

Then push again so Actions rebuilds.

### Static site in a subfolder (like `paper/tutorial`)

The `paper` folder uses a plain HTML site under `tutorial/` deployed from the branch root. This project is the **app root** of the `storytelling-pilot` repo (same idea as `tutorial/` being the deployable unit, but built with Vite).

## Data storage

- **localStorage key:** `hciDiaryStudyData`
- **Active participant key:** `hciDiaryStudyActiveParticipant`
- Export via **Export & Data** in the app

## Privacy

Entries stay in this browser only. Export JSON and send to the researcher when asked. Data may be lost if you clear browser storage, use private browsing, or switch devices.
