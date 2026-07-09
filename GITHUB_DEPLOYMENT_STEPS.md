# Deploy this app to GitHub Pages

This project is a Vite + React app. It has already been prepared for GitHub Pages with:

- `vite.config.ts` using `base: './'`
- `.github/workflows/deploy.yml` for automatic GitHub Pages deployment
- `public/.nojekyll`

## 1. Create a GitHub repository

Suggested repository name:

```text
vessel-survey-inspection-manager
```

Keep it Public if you want free GitHub Pages hosting.

## 2. Upload the project

### Option A — easiest, using GitHub website

1. Open the new GitHub repository.
2. Click **Add file** → **Upload files**.
3. Upload all files/folders from this project.
4. Commit to the `main` branch.

### Option B — using terminal

```bash
git init
git add .
git commit -m "Initial vessel survey manager site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vessel-survey-inspection-manager.git
git push -u origin main
```

## 3. Enable GitHub Pages

1. Go to repository **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Go to the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.

Your site should be published at:

```text
https://YOUR_USERNAME.github.io/vessel-survey-inspection-manager/
```

## 4. Test locally before upload

```bash
npm install
npm run dev
```

For a production test:

```bash
npm run build
npm run preview
```

## Important note

This version stores data in the browser's `localStorage`. That means each user/browser has its own data. If you want login, shared company database, attachments, and multi-user access, you need a backend/database such as Firebase, Supabase, or a custom server.
