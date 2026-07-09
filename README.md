# Data Structures Visualizer

## Run locally
1. Install Node.js 18+ (nodejs.org) if you don't have it: `node -v` to check.
2. In this folder:
   npm install
   npm run dev
3. Open the URL it prints (usually http://localhost:5173).

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds and deploys automatically on every push to `main`.

One-time setup after pushing to GitHub:
1. Go to your repo on GitHub → Settings → Pages.
2. Under "Build and deployment" → Source, select "GitHub Actions".
3. Push to `main` (or re-run the workflow from the Actions tab).
4. Your site will be live at https://<your-username>.github.io/<repo-name>/

If your repo name isn't "ds-visualizer", update the `base` value in
vite.config.js to match before pushing.

## Build for other hosts
   npm run build
Outputs static files to dist/ which you can host anywhere (Vercel, Netlify, S3, etc).
For those hosts, set `base: "/"` in vite.config.js instead.
