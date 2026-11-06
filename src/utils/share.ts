import type { Transaction } from '../types'
import { getFundingSource } from './funding'
import { formatDate, formatTime } from './storage'
import { formatINR } from './upiParser'

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

/** Builds the plain-text receipt used by the native share sheet. */
export function buildReceiptText(transaction: Transaction): string {
  const source = getFundingSource(transaction.fundingSource)
  return [
    'CURIE · PAYMENT RECEIPT',
    '',
    `${formatINR(transaction.amount)} paid to ${transaction.merchantName}`,
    `UPI ID: ${transaction.payeeUpiId}`,
    `Date: ${formatDate(transaction.timestamp)}`,
    `Time: ${formatTime(transaction.timestamp)}`,
    `Reference: ${transaction.reference}`,
    `Mode: UPI (simulated)`,
    `From: ${source.name} · ${source.maskedAccount}`,
    ...(transaction.note ? [`Note: ${transaction.note}`] : []),
    '',
    'SIMULATION · NO MONEY TRANSFERRED',
    'Generated locally by Curie. Not a bank receipt.',
  ].join('\n')
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 2)
}

/** Draws a clean, shareable receipt image on a canvas. */
function drawReceipt(transaction: Transaction): HTMLCanvasElement {
  const width = 720
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const source = getFundingSource(transaction.fundingSource)
  const ink = '#F2F1EA'
  const soft = '#A6ABA3'
  const faint = '#6D736B'
  const accent = '#C9F27C'
  const line = '#262B27'

  ctx.fillStyle = '#080A09'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#121513'
  roundedRect(ctx, 40, 40, width - 80, height - 80, 40)
  ctx.fill()

  ctx.strokeStyle = line
  ctx.lineWidth = 2
  roundedRect(ctx, 40, 40, width - 80, height - 80, 40)
  ctx.stroke()

  const left = 88
  const right = width - 88

  ctx.fillStyle = ink
  ctx.font = '400 48px "Instrument Serif", Georgia, serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('curie', left, 132)

  ctx.fillStyle = faint
  ctx.font = '600 14px "Instrument Sans", Arial, sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillText('PAYMENT RECEIPT', left, 168)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(left + 6, 218, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = soft
  ctx.font = '600 15px "Instrument Sans", Arial, sans-serif'
  ctx.fillText('PAYMENT COMPLETED', left + 22, 224)

  ctx.fillStyle = ink
  ctx.font = '400 68px "Instrument Serif", Georgia, serif'
  ctx.fillText(formatINR(transaction.amount), left, 320)

  ctx.fillStyle = faint
  ctx.font = '600 13px "Instrument Sans", Arial, sans-serif'
  ctx.fillText('PAID TO', left, 378)

  ctx.fillStyle = ink
  ctx.font = '600 28px "Instrument Sans", Arial, sans-serif'
  const nameLines = wrapText(ctx, transaction.merchantName, right - left)
  let nameY = 416
  for (const nameLine of nameLines) {
    ctx.fillText(nameLine, left, nameY)
    nameY += 36
  }

  ctx.fillStyle = soft
  ctx.font = '400 18px "Instrument Sans", Arial, sans-serif'
  ctx.fillText(transaction.payeeUpiId, left, nameY + 4)

  const dividerY = nameY + 46
  ctx.strokeStyle = line
  ctx.beginPath()
  ctx.moveTo(left, dividerY)
  ctx.lineTo(right, dividerY)
  ctx.stroke()

  const rows: [string, string][] = [
    ['Date', formatDate(transaction.timestamp)],
    ['Time', formatTime(transaction.timestamp)],
    ['Reference', transaction.reference],
    ['Mode', 'UPI (simulated)'],
    ['From', `${source.name} · ${source.maskedAccount}`],
  ]

  let rowY = dividerY + 48
  for (const [label, value] of rows) {
    ctx.fillStyle = faint
    ctx.font = '400 17px "Instrument Sans", Arial, sans-serif'
    ctx.fillText(label, left, rowY)

    ctx.fillStyle = ink
    ctx.font = '500 18px "Instrument Sans", Arial, sans-serif'
    const valueWidth = ctx.measureText(value).width
    ctx.fillText(value, right - valueWidth, rowY)
    rowY += 46
  }

  if (transaction.note) {
    ctx.fillStyle = faint
    ctx.font = '400 17px "Instrument Sans", Arial, sans-serif'
    ctx.fillText('Note', left, rowY)
    ctx.fillStyle = soft
    ctx.font = '500 18px "Instrument Sans", Arial, sans-serif'
    const noteLines = wrapText(ctx, transaction.note, 300)
    let noteY = rowY
    for (const noteLine of noteLines) {
      const noteWidth = ctx.measureText(noteLine).width
      ctx.fillText(noteLine, right - noteWidth, noteY)
      noteY += 26
    }
    rowY += 46
  }

  ctx.strokeStyle = line
  ctx.beginPath()
  ctx.moveTo(left, rowY + 8)
  ctx.lineTo(right, rowY + 8)
  ctx.stroke()

  ctx.fillStyle = faint
  ctx.font = '600 13px "Instrument Sans", Arial, sans-serif'
  ctx.fillText('SIMULATED SOURCE', left, rowY + 56)

  ctx.fillStyle = ink
  ctx.font = '600 20px "Instrument Sans", Arial, sans-serif'
  ctx.fillText(source.name, left, rowY + 88)
  ctx.fillStyle = soft
  ctx.font = '400 17px "Instrument Sans", Arial, sans-serif'
  ctx.fillText(
    `${source.accountType} · ${source.maskedAccount}`,
    left,
    rowY + 118,
  )

  ctx.fillStyle = '#1B2414'
  roundedRect(ctx, left, 902, right - left, 44, 22)
  ctx.fill()
  ctx.fillStyle = accent
  ctx.font = '600 13px "Instrument Sans", Arial, sans-serif'
  const simText = 'SIMULATION · NO MONEY TRANSFERRED'
  const simWidth = ctx.measureText(simText).width
  ctx.fillText(simText, width / 2 - simWidth / 2, 930)

  ctx.fillStyle = faint
  ctx.font = '400 13px "Instrument Sans", Arial, sans-serif'
  const footer = 'Generated locally by Curie · not a bank receipt'
  const footerWidth = ctx.measureText(footer).width
  ctx.fillText(footer, width / 2 - footerWidth / 2, 986)

  return canvas
}

/** Downloads a PNG receipt to the device. */
export function downloadReceipt(transaction: Transaction): void {
  const canvas = drawReceipt(transaction)
  const link = document.createElement('a')
  link.download = `curie-receipt-${transaction.reference}.png`
  link.href = canvas.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/**
 * Opens the native share sheet when available. When sharing is unsupported or
 * fails, a PNG receipt is downloaded instead.
 */
export async function shareTransaction(
  transaction: Transaction,
): Promise<ShareResult> {
  const text = buildReceiptText(transaction)

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: 'Curie payment receipt',
        text,
      })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
    }
  }

  downloadReceipt(transaction)
  return 'downloaded'
}
