# Paisa — UPI checkout

Paisa is a small, local-first UPI checkout interface built with React,
TypeScript, Vite and Tailwind CSS. It reads UPI QR codes, walks through a
payment flow, and keeps the resulting history on the device.

The interface is a prototype. It runs entirely in the browser, makes no network
requests, and is not connected to a bank, a payment gateway, or the UPI network.

## Features

- **Pay** — one primary scan action, manual UPI ID entry, and recent activity.
- **Scan** — camera scanning via `html5-qrcode`, image-upload fallback, and
  clear permission / no-camera states.
- **Payment** — payee summary, QR amount prefill, a large decimal keypad, quick
  amounts and a ₹1,00,000 cap.
- **Success** — a full-screen green panel wipes down, draws a white check with a
  soft halo, then lifts to reveal the receipt. A two-note chime plays alongside
  it, with light haptics where supported.
- **Confirmation** — a quiet receipt-style screen with the amount, payee, UPI
  ID, timestamp and a 12-digit reference.
- **Activity** — month-grouped history with totals, per-item delete and a
  bottom-sheet clear confirmation.
- **Settings** — light / dark / system theme, success-sound toggle, local data
  controls and app info.

## Design

- Mobile-first: a single centred column, capped at 520px, with a bottom tab bar
  on phones and a slim top bar on larger screens.
- Warm paper, ink and deep green palette; Instrument Sans for UI text and
  Instrument Serif for display numbers and headings.
- Hairline dividers instead of stacked cards, flat controls, and restrained
  motion. Dark mode is a first-class variant, not an afterthought.
- The success panel uses the same deep green as the accent, a hand-drawn check,
  and a short chime. Both respect `prefers-reduced-motion` and the sound
  preference; tapping the panel skips straight to the receipt.

## UPI payload support

QR codes must use the standard URI shape:

```
upi://pay?pa=merchant@upi&pn=Merchant%20Name&am=100.50&cu=INR&tn=Note
```

`am` is interpreted in **rupees** (per the UPI spec). The app validates the
payee VPA, amount and currency, and rejects non-UPI QR codes with an inline
message.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # preview the production build
```

Camera access requires **HTTPS or localhost**. On desktop without a camera, use
the image-upload fallback or enter a UPI ID manually.

## Project structure

```
src/
  components/
    AmountInput.tsx        Keypad amount entry
    ManualUpiForm.tsx      Validated manual VPA entry
    Navbar.tsx             Top bar + mobile bottom tabs
    ProcessingAnimation.tsx Pending state
    QRScanner.tsx          Camera + image-upload scanner
    SuccessAnimation.tsx   Success wipe + receipt reveal
    TransactionItem.tsx    History row
  pages/
    Home.tsx  Scanner.tsx  Payment.tsx  History.tsx  Settings.tsx
  types/index.ts           Shared types
  utils/
    sound.ts               Web Audio priming + chime playback
    upiParser.ts           UPI URI parsing + INR formatting
    storage.ts             LocalStorage history, theme + sound helpers
public/
  sounds/payment-success.wav  Success chime
  App.tsx                  Navigation, theme and payment state machine
  index.css                Tailwind v4 tokens, fonts and animations
```

## Privacy

Everything happens in the browser. The camera feed is processed locally, and
payment history, the theme preference and the sound preference are stored in
`localStorage` under `paisa.*` keys. The success chime is bundled with the app,
so it needs no network access.

## Limitations

- No real UPI integration; no money moves.
- Amounts are capped at ₹1,00,000 per payment.
- History is per-browser and is lost when site data is cleared.
- Camera scanning depends on browser permissions and a secure context.

Paisa is an independent project and is not affiliated with any bank or UPI
application.
