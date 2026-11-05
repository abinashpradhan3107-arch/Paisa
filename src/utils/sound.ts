/**
 * Success chime playback.
 *
 * The clip lives in `public/sounds/payment-success.wav`. Playback goes through
 * the Web Audio API so the buffer can be primed during the "Pay" tap (a real
 * user gesture) and played a moment later when the confirmation appears.
 */

let context: AudioContext | null = null
let bufferPromise: Promise<AudioBuffer | null> | null = null
let muted = false

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!context) {
    const AudioContextCtor =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext
        }
      ).webkitAudioContext
    if (!AudioContextCtor) return null
    context = new AudioContextCtor()
  }

  return context
}

/** Keeps the sound module in sync with the user's preference. */
export function setSoundEnabled(enabled: boolean): void {
  muted = !enabled
}

/** Fetches and decodes the chime. Safe to call repeatedly. */
export function primeSuccessSound(): void {
  const ctx = getContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {})
  }

  if (!bufferPromise) {
    bufferPromise = fetch(`${import.meta.env.BASE_URL}sounds/payment-success.wav`)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .then((data) => (data ? ctx.decodeAudioData(data) : null))
      .catch(() => null)
  }
}

/** Plays the success chime once. Fails silently when audio is unavailable. */
export async function playSuccessSound(volume = 0.7): Promise<void> {
  if (muted) return

  primeSuccessSound()
  const ctx = context
  if (!ctx) return

  try {
    if (ctx.state === 'suspended') {
      /* Do not block on resume: a suspended context still schedules the source. */
      void ctx.resume().catch(() => {})
    }
    const buffer = await bufferPromise
    if (!buffer || muted) return

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  } catch {
    // Audio is a progressive enhancement; never block the confirmation.
  }
}
