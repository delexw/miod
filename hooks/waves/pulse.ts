import { pickChar, scrollingWindow, splitRow } from './shared'
import type { WaveLook } from './shared'

const SIZES = '·∙•●⬤'

export const pulse: WaveLook = {
  rows: 1,
  draw: (levels, width, played) => {
    const count = Math.max(1, Math.floor(width / 2))
    const { heights, split } = scrollingWindow(levels, count, played)
    return [splitRow(heights.map(level => `${pickChar(SIZES, level)} `), split)]
  },
}
