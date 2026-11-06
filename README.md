# Curie — UPI payment simulator

Curie is a dark, mobile-first UPI payment **simulator** built with React,
TypeScript, Vite and Tailwind CSS. It scans UPI QR codes, walks through a
complete payment journey, and keeps simulated receipts on the device.

> **Simulation only.** Curie never contacts a bank, a payment gateway or the UPI
> network. No money moves, and no real payment intent is ever created.

## Features

- **Home** — Curie wordmark, a simulated ₹50,000 wallet balance, a large
  amount readout, a decimal keypad with backspace and clear, and one prominent
  scan action.
- **Scanner** — live camera scanning via `html5-qrcode`, an animated scan
  frame, gallery upload, manual UPI ID entry, close control, and graceful
  permission-denied / no-camera states. Valid UPI QR codes auto-advance.
- **Recipient** — avatar, merchant name, UPI ID, editable amount with keypad,
  optional note, and a simulated funding source (Curie Wallet or a simulated
  bank account). QR preset amounts and notes are prefilled.
- **Processing** — an animated indicator with the recipient and amount for
  about two seconds.
- **Success** — drawn checkmark, "Payment completed", amount, recipient,
  date/time, reference, View details, Share and Done.
- **Receipt details** — Curie branding, status, date/time, paid-to,
  debited-from, expandable transfer details (reference, RRN, transaction ID,
  payment mode), share/download and delete.
- **History** — month-grouped simulated payments with recipient, amount, date,
  time and status. Tap a row to open its receipt.
- **Profile** — simulated wallet, success-sound preference, reset balance,
  clear history and app information.
- **Simulation clarity** — a `Simulated` badge on the main screens, and a clear
  `SIMULATION · NO MONEY TRANSFERRED` disclosure on the payment confirmation and
  receipt.

## Design

- Dark-only palette: near-black paper, soft card surfaces, lime accent, mint
  success and coral danger.
- Instrument Sans for interface text and Instrument Serif for the wordmark,
  balances and large amounts.
- A single centred column capped at `480px`, with a fixed bottom navigation and
  an elevated lime Scan action.
- Restrained motion, 44px tap targets, and layout that fits 360px-wide phones.

## UPI payload support

QR codes must use the standard URI shape:

```
upi://pay?pa=merchant@upi&pn=Merchant%20Name&am=100.50&cu=INR&tn=Note
```

`am` is interpreted in **rupees** (per the UPI spec). The parser validates the
payee VPA, amount and currency, rejects non-UPI QR codes, and rejects amounts
above ₹1,00,000.

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

Camera access requires **HTTPS or localhost**. Without a camera, use the gallery
upload or enter a UPI ID manually.

## Simulated money

- The wallet starts at **₹50,000** and is stored under `curie.balance.v1`.
- Paying from **Curie Wallet** deducts the amount from the simulated balance.
- Paying from the **simulated bank account** leaves the wallet untouched.
- Reset the balance from Profile at any time.

## Project structure

```
src/
  App.tsx                  Navigation, balance, history and payment state machine
  components/
    AmountDisplay.tsx      Large amount readout
    AmountKeypad.tsx       Decimal keypad with backspace
    BottomNav.tsx          Home / History / Scan / Profile navigation
    ManualUpiForm.tsx      Validated manual VPA entry
    ProcessingAnimation.tsx Two-second pending state
    QRScanner.tsx          Camera, gallery upload and manual fallback
    Sheet.tsx              Bottom sheet
    SuccessScreen.tsx      Completion screen and actions
    TransactionDetails.tsx Receipt overlay
    TransactionItem.tsx    History row
  pages/
    Home.tsx  Payment.tsx  Scanner.tsx  History.tsx  Profile.tsx
  types/index.ts           Shared types
  utils/
    amount.ts              Amount parsing and formatting
    clipboard.ts           Clipboard helper
    display.ts             Initials helper
    funding.ts             Simulated funding sources and limits
    share.ts               Native share + PNG receipt fallback
    sound.ts               Web Audio priming + chime playback
    storage.ts             LocalStorage history, balance and sound
    upiParser.ts           UPI URI parsing + INR formatting
public/
  sounds/payment-success.wav  Success chime
```

## Privacy

Everything happens in the browser. The camera feed is processed locally, and
payment history, the simulated balance and the sound preference are stored in
`localStorage` under `curie.*` keys. Legacy `paisa.*` keys are migrated on load.
The success chime is bundled with the app, so it needs no network access.

## Limitations

- No real UPI integration; no money moves.
- Amounts are capped at ₹1,00,000 per payment.
- History is per-browser and is lost when site data is cleared.
- Camera scanning depends on browser permissions and a secure context.

Curie is an independent project and is not affiliated with any bank or UPI
application.
