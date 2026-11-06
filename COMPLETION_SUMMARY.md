# Curie — Project Status

## Status: complete and buildable

`npm run build` and `npm run lint` pass, and the dev server runs the full
simulated payment journey.

## What works

### Home
- Curie wordmark and a persistent `SIMULATION · NO MONEY TRANSFERRED` line.
- Simulated wallet balance (starts at ₹50,000).
- Large amount readout with a decimal keypad, backspace and clear.
- One prominent scan action, manual UPI ID entry and the three most recent
  simulated payments.

### QR scanner
- Camera scanning with `html5-qrcode` and an animated scan frame.
- Gallery image upload for devices without a camera.
- Graceful permission-denied / no-camera / insecure-context states with retry.
- UPI URI parsing, inline errors for invalid QR codes, and auto-advance on a
  valid UPI QR.
- Manual UPI ID entry with VPA validation.

### Payment flow
- Recipient summary with initials, name and UPI ID.
- Editable amount with a decimal keypad, clear, QR preset amount and note
  prefill, and a ₹1,00,000 cap.
- Optional note and a simulated funding source: Curie Wallet or a simulated bank
  account.
- Wallet payments deduct from the simulated balance; bank payments do not.
- 2 second processing screen naming the recipient and amount.
- Success screen with a drawn check, "Payment completed", amount, recipient,
  date/time, reference, View details, Share and Done.
- Success chime through the Web Audio API, primed on the Pay tap, plus light
  haptics where supported.
- Done resets the amount and returns home while preserving history.

### Receipt
- Fixed overlay so the Success screen is not remounted and the chime does not
  replay.
- Curie branding, status, date/time, paid-to, debited-from and expandable
  transfer details (reference, payment mode, payee UPI, date, time, amount,
  transaction ID, RRN).
- Native share when available, otherwise a downloadable PNG receipt.
- Copy reference and delete-record confirmation.
- Background scroll is locked while the receipt is open.

### History
- Month-grouped, newest-first list with recipient, amount, date, time and
  status.
- Tap any row to open its receipt.
- Empty state with a scan shortcut.
- Persists in LocalStorage under `curie.history.v1`.

### Profile
- Simulated wallet balance and a no-real-funds notice.
- Success-sound switch persisted as `curie.sound.v1`.
- Reset simulated balance and clear-history confirmation.
- About and app information.

## Technical notes

- React 19 + TypeScript (strict flags: `verbatimModuleSyntax`,
  `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`).
- Tailwind CSS v4 via `@tailwindcss/postcss`, with design tokens and keyframes
  declared in `src/index.css`.
- Typography: `@fontsource-variable/instrument-sans` and
  `@fontsource/instrument-serif`.
- Mobile-first shell: a centred `max-w-[480px]` column with a fixed bottom
  navigation and an elevated lime Scan action.
- Dark-only palette: paper `#0A0C0B`, card `#121513`, ink `#F2F1EA`, lime
  accent `#C9F27C`, success `#5EE0A0`, danger `#FF8F80`.
- The success chime lives in `public/sounds/payment-success.wav` and is played
  via `src/utils/sound.ts`; the buffer is fetched and decoded during the Pay
  tap, then started when the confirmation appears.
- No backend, no API calls, no real payment intent.

## Verification

```bash
npm run build   # passes
npm run lint    # passes with no warnings
npm run dev     # serves the app at http://localhost:5173
```

The flow was also exercised headlessly at 360×640, 390×844 and 430×932,
including the full journey, gallery QR upload, preset amounts and notes, wallet
vs bank funding, invalid QRs, invalid amounts, parser edge cases, long names,
history persistence, receipt share/download and responsive layout.

Camera scanning requires HTTPS or localhost. On desktop, use the gallery upload
or manual UPI ID options.

## Core principle

The app is a local simulator and never initiates a real payment. Every screen
keeps a visible `SIMULATION · NO MONEY TRANSFERRED` disclosure.
