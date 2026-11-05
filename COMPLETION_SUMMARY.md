# Paisa — Project Status

## Status: complete and buildable

`npm run build` and `npm run lint` pass, and the dev server runs the full flow.

## What works

### Pay (home)
- Paisa wordmark, date and greeting, and the current month's total.
- One primary scan action, always-visible manual UPI ID entry, and the four most
  recent payments.
- Empty state that points to scanning or manual entry.

### QR scanner
- Camera scanning with `html5-qrcode` (correct v2 API usage).
- Image-upload fallback for devices without a camera.
- Graceful permission denied / no camera / insecure context states.
- UPI URI parsing and inline errors for invalid QR codes.
- Manual UPI ID entry with VPA validation.

### Payment flow
- Inline payee summary with initials, name, UPI ID and optional note.
- Amount entry with a decimal keypad, quick amounts and the ₹1,00,000 cap.
- 1.6 second pending screen; the app owns the single timer.
- Full-screen success panel: a green wipe, an animated white check with halo
  rings, the amount and payee, then a wipe-up to reveal the receipt. Tapping
  skips ahead; reduced-motion users get a short, static hold.
- Success chime played through the Web Audio API, primed on the Pay tap so it
  starts with the panel. Light haptics where the device supports it.
- Receipt-style confirmation with amount, payee, UPI ID, timestamp and a
  12-digit reference.
- Exactly one record is written to LocalStorage per payment.

### Activity (history)
- Month-grouped, newest-first list with totals, per-item delete and a
  bottom-sheet clear-all confirmation.
- Empty state with a scan shortcut.

### Settings
- Light / dark / system theme, persisted and applied to `<html>`.
- Success-sound switch under Feedback, persisted as `paisa.sound.v1`.
- Payment count and clear-history confirmation.
- About and app information.

## Technical notes

- React 19 + TypeScript (strict flags: `verbatimModuleSyntax`,
  `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`).
- Tailwind CSS v4 via `@tailwindcss/postcss`, with design tokens and keyframes
  declared in `src/index.css`. The old v3 `tailwind.config.js` was removed.
- Typography: `@fontsource-variable/instrument-sans` and
  `@fontsource/instrument-serif`.
- Mobile-first shell: a centred `max-w-[520px]` column, bottom tabs on phones,
  top navigation on desktop.
- Dark mode uses a class-based `dark` variant with CSS variables for every
  semantic colour.
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

Camera scanning requires HTTPS or localhost. On desktop, use the image upload
or manual UPI ID options.

## Core principle

The app is a local prototype and never initiates a real payment. The only
remaining notice is an understated line in Settings → About.
