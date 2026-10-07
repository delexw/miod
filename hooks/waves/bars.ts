import { clamp, scrollingWindow, splitRow } from './shared'
import type { WaveLook } from './shared'

const BLOCKS = '▁▂▃▄▅▆▇█'
const ROWS = 2

export function barCell(level: number, row: number): string {
  const eighths = Math.max(1, Math.round(clamp(level) * ROWS * 8))
  const inRow = Math.max(0, Math.min(8, eighths - (ROWS - 1 - row) * 8))
  return inRow === 0 ? ' ' : BLOCKS.charAt(inRow - 1)
}

export const bars: WaveLook = {
  rows: ROWS,
  draw: (levels, width, played) => {
    const count = Math.max(1, Math.floor(width / 2))
    const { heights, split } = scrollingWindow(levels, count, played)
    return Array.from({ length: ROWS }, (_, row) => splitRow(heights.map(level => `${barCell(level, row)} `), split))
  },
}
