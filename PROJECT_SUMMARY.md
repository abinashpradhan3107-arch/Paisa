# Curie — UPI payment simulator

A dark, mobile-first UPI payment simulator built with React, TypeScript, Vite
and Tailwind CSS.

**Run it:** `npm run dev` → <http://localhost:5173>

## Core principle

Curie is a local simulator. It does not contact banks, payment gateways or the
UPI network, and it never creates a real payment. The main screens carry a
`Simulated` badge, while the payment confirmation and receipt keep a clear
`SIMULATION · NO MONEY TRANSFERRED` disclosure. History, the simulated wallet
balance and the sound preference live only in the browser's LocalStorage.

## Feature checklist

| Area | Delivered |
| --- | --- |
| Home | Curie wordmark, simulated ₹50,000 wallet, amount display, decimal keypad, clear, prominent scan action, recent payments |
| Scanner | Live camera, animated frame, gallery upload, manual VPA, auto-advance, close, graceful permission handling |
| Recipient | Avatar, name, UPI ID, editable amount, keypad, optional note, wallet/bank funding, QR prefill, validation |
| Pending | 2s animated state naming the recipient and amount |
| Success | Drawn check, "Payment completed", amount, recipient, date/time, reference, View details, Share, Done |
| Receipt | Status, paid-to, debited-from, expandable transfer details, share/download PNG, delete |
| History | Month-grouped rows with recipient, amount, date, time and status; tap opens the receipt |
| Profile | Simulated wallet, success-sound switch, reset balance, clear history, about |
| Navigation | Home / History / Scan / Profile with an elevated Scan action |
| Quality | Strict TypeScript, oxlint clean, 44px tap targets, responsive down to 360px |

## Architecture

- `src/App.tsx` owns navigation, the simulated balance, history and the payment
  state machine (`recipient → processing → success`), so there is one timer and
  one save per checkout. The receipt is a fixed overlay, so returning to Success
  does not remount it or replay the chime.
- `src/utils/upiParser.ts` parses `upi://pay` URIs, treats `am` as rupees,
  validates VPAs/currency and formats INR with `Intl.NumberFormat`.
- `src/utils/storage.ts` persists history, balance and sound under `curie.*`
  keys, with defensive parsing, legacy `paisa.*` migration and a 200-record cap.
- `src/utils/funding.ts` defines the two simulated funding sources and the
  ₹1,00,000 limit; wallet payments deduct from the simulated balance.
- `src/utils/share.ts` uses the native share sheet when available and otherwise
  renders a downloadable PNG receipt on a canvas.
- `src/utils/sound.ts` primes and plays the bundled success chime through the
  Web Audio API, so the sound never blocks the confirmation.
- `src/index.css` defines the dark-only Tailwind v4 theme: near-black surfaces,
  lime accent, mint success, coral danger, Instrument Sans and Instrument Serif.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Limitations

- Simulator only; no real UPI integration.
- Maximum amount: ₹1,00,000.
- Camera requires HTTPS or localhost; gallery upload and manual entry work
  everywhere.
- History is per-browser and cleared with site data.
