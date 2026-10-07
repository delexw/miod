import { pickChar, scrollingWindow, splitRow } from './shared'
import type { WaveLook } from './shared'

const DOTS = '⡀⣀⣄⣤⣦⣶⣷⣿'

export const dots: WaveLook = {
  rows: 1,
  draw: (levels, width, played) => {
    const count = Math.max(1, width)
    const { heights, split } = scrollingWindow(levels, count, played)
    return [splitRow(heights.map(level => pickChar(DOTS, level)), split)]
  },
}
