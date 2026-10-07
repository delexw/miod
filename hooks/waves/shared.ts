export type WaveRow = { done: string; ahead: string }

export type WaveLook = {
  rows: number
  draw: (levels: readonly number[], width: number, played: number) => WaveRow[]
}

export function resample(levels: readonly number[], count: number): number[] {
  return Array.from({ length: count }, (_, i) => clamp(levels[Math.floor((i * levels.length) / count)] ?? 0))
}

export function playedCount(levels: readonly number[], played: number, count: number): number {
  return Math.min(count, Math.round((played / Math.max(1, levels.length)) * count))
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
