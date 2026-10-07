export type WaveRow = { done: string; ahead: string }

export type WaveLook = {
  rows: number
  draw: (levels: readonly number[], width: number, played: number) => WaveRow[]
}

export type WaveWindow = { heights: number[]; split: number }

export function scrollingWindow(levels: readonly number[], count: number, played: number): WaveWindow {
  const split = Math.floor((count * 2) / 3)
  const heights = Array.from({ length: count }, (_, i) => clamp(levels[played - split + i] ?? 0))
  return { heights, split }
}

export function splitRow(cells: readonly string[], split: number): WaveRow {
  return { done: cells.slice(0, split).join(''), ahead: cells.slice(split).join('') }
}

export function clamp(level: number): number {
  return Math.max(0, Math.min(1, level))
}

export function pickChar(chars: string, level: number): string {
  return chars.charAt(Math.round(clamp(level) * (chars.length - 1)))
}
