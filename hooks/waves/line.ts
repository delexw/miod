import { pickChar, scrollingWindow, splitRow } from './shared'
import type { WaveLook } from './shared'

const BLOCKS = '▁▂▃▄▅▆▇█'

export const line: WaveLook = {
  rows: 1,
  draw: (levels, width, played) => {
    const count = Math.max(1, width)
    const { heights, split } = scrollingWindow(levels, count, played)
    return [splitRow(heights.map(level => pickChar(BLOCKS, level)), split)]
  },
}
