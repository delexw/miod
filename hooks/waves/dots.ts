import { pickChar, playedCount, resample, splitRow } from './shared'
import type { WaveLook } from './shared'

const DOTS = '⡀⣀⣄⣤⣦⣶⣷⣿'

export const dots: WaveLook = {
  rows: 1,
  draw: (levels, width, played) => {
    const count = Math.max(1, width)
    const cells = resample(levels, count).map(level => pickChar(DOTS, level))
    return [splitRow(cells, playedCount(levels, played, count))]
  },
}
