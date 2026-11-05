# Paisa — UPI checkout

A small, mobile-first UPI checkout interface built with React, TypeScript, Vite
and Tailwind CSS.

**Live app:** `npm run dev` → <http://localhost:5173>

## Core principle

Paisa is a local prototype. It does not contact banks, payment gateways or the
UPI network, and it never creates a real payment. History lives only in the
browser's LocalStorage.

## Feature checklist

| Area | Delivered |
| --- | --- |
| Pay | Greeting, month total, scan action, manual VPA, recent list |
| Scanner | Camera, image upload, manual VPA, permission handling |
| Payment | Inline payee summary, QR prefill, keypad, validation |
| Pending | 1.6s state with a single timer owned by the app |
| Success | Green wipe, animated check, chime, haptics, receipt reveal |
| Confirmation | Amount, payee, timestamp, 12-digit reference |
| Activity | Month-grouped history, totals, delete, clear confirmation |
| Settings | Light/dark/system theme, sound toggle, data controls, about |
| Navigation | Mobile bottom tabs + desktop top bar, dark mode |
| Quality | Strict TypeScript, oxlint clean, responsive, accessible |

## Architecture

- `src/App.tsx` owns navigation, theme, history and the payment state machine
  (`details → processing → success`), so there is one timer and one save per
  checkout.
- `src/utils/upiParser.ts` parses `upi://pay` URIs, treats `am` as rupees,
  validates VPAs/currency and formats INR with `Intl.NumberFormat`.
- `src/utils/storage.ts` persists history, theme and sound preferences under
  `paisa.*` keys with defensive parsing and a 200-record cap.
- `src/utils/sound.ts` primes and plays the bundled success chime through the
  Web Audio API, so the sound never blocks the confirmation.
- `src/index.css` defines the Tailwind v4 theme: warm paper / ink / deep green
  tokens, Instrument Sans and Instrument Serif, a class-based dark variant, and
  a small set of animations (including the success wipe, check draw and halo).

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Limitations

- Prototype only; no real UPI integration.
- Maximum amount: ₹1,00,000.
- Camera requires HTTPS or localhost; image upload and manual entry work
  everywhere.
- History is per-browser and cleared with site data.
