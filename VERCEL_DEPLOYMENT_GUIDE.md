# Curie - Vercel Deployment Guide

## Overview
Curie is a dark, mobile-first UPI payment simulator built with React + TypeScript + Vite.

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

1. **Push to GitHub** (already done):
   - Repository: https://github.com/abinashpradhan3107-arch/Paisa

2. **Import to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project" → "Import Repository"
   - Select your GitHub repo: `abinashpradhan3107-arch/Paisa`
   - Vercel will auto-detect it's a Vite/React project

3. **Vercel Settings:**
   - Framework Preset: Vite (auto-detected)
   - Root Directory: `/` (default)
   - Build Command: `npm run build`
   - Output Directory: `dist` (Vite default) OR leave empty for Vite's `hms` handler

4. **Environment Variables:** None required (app uses LocalStorage only)

5. **Deploy:** Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
# Or: vercel --prod
```

### Method 3: Vercel.json Configuration

Create `vercel.json` in the project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": {
    "/(.*)": "index.html"
  }
}
```

Then deploy:
```bash
vercel
```

## Important Notes

### ✅ What Works on Vercel
- Home screen with the Curie wordmark
- QR code scanning (may have camera limitations on web)
- UPI payload parsing and display
- Payment simulation flow
- Transaction history (LocalStorage persists per user)
- Dark-only theme
- Navigation between pages

### ⚠️ Known Limitations on Vercel
- **Camera/QR scanning**: Vercel's serverless environment doesn't have access to local cameras. QR scanning will show permission errors gracefully.
- **Workaround**: The "Enter UPI ID manually" option works fully on Vercel.
- **LocalStorage**: Persists per-user session on Vercel.

### ❌ Not Affected
- No real financial transactions (already simulated locally)
- No bank connections (none exist)
- Simulation disclosure and disclaimers (always displayed)
- Manual UPI ID entry
- Payment confirmation animation
- Transaction history (stored per session)

### Build Configuration
If the Vite build outputs to a custom directory, update `vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",  // or "build" depending on config
  "routes": {
    "/(.*)": "index.html"
  }
}
```

Vite's default `outputDirectory` is `dist`, but check your build output.

### Deploy Command

```bash
# From project root
vercel

# Or for production:
vercel --prod
```

## Post-Deployment

After deployment, verify:
1. ✅ Home screen loads
2. ✅ "Enter UPI ID manually" works (QR scanning limited on web)
3. ✅ Payment simulation flow works
4. ✅ History persists per session
5. ✅ Simulation disclosure is visible on every screen

## Repository

The code is at: https://github.com/abinashpradhan3107-arch/Paisa

Deploy your fork and Curie, the UPI payment simulator, will be live!