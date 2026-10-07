import { pickChar, playedCount, resample, splitRow } from './shared'
import type { WaveLook } from './shared'

const SIZES = '·∙•●⬤'

export const pulse: WaveLook = {
  rows: 1,
  draw: (levels, width, played) => {
    const count = Math.max(1, Math.floor(width / 2))
    const cells = resample(levels, count).map(level => `${pickChar(SIZES, level)} `)
    return [splitRow(cells, playedCount(levels, played, count))]
  },
}
