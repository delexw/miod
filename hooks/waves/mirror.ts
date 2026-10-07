import { pickChar, playedCount, resample, splitRow } from './shared'
import type { WaveLook } from './shared'

const UP = '▁▂▃▄▅▆▇█'
const DOWN = '▔▔▀▀▀██'

export const mirror: WaveLook = {
  rows: 2,
  draw: (levels, width, played) => {
    const count = Math.max(1, Math.floor(width / 2))
    const heights = resample(levels, count)
    const split = playedCount(levels, played, count)
    return [
      splitRow(heights.map(level => `${pickChar(UP, level)} `), split),
      splitRow(heights.map(level => `${pickChar(DOWN, level)} `), split),
    ]
  },
}
