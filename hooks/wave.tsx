import type { ClientModule } from 'claude-code'

import type { NowPlaying } from '../types'

const BARS = '▁▂▃▄▅▆▇█'

type WaveState = { clipId: number; frame: number }

export function barFor(level: number): string {
  const index = Math.round(Math.max(0, Math.min(1, level)) * (BARS.length - 1))
  return BARS.charAt(index)
}

export function drawWave(levels: readonly number[], width: number, played: number): { done: string; ahead: string } {
  const columns = Math.max(1, width)
  const bars = Array.from({ length: columns }, (_, c) => barFor(levels[Math.floor((c * levels.length) / columns)] ?? 0))
  const split = Math.min(columns, Math.round((played / Math.max(1, levels.length)) * columns))
  return { done: bars.slice(0, split).join(''), ahead: bars.slice(split).join('') }
}

const Wave: ClientModule<NowPlaying, WaveState> = (clip, surface) => {
  const { Box, Text } = surface.elements

  if (surface.state === undefined) {
    surface.setState({ clipId: clip.clipId, frame: 0 })
    surface.every(1000 / clip.pointsPerSecond, () => {
      const state = surface.state
      if (state) {
        surface.setState({ ...state, frame: state.frame + 1 })
      }
    })
  } else if (surface.state.clipId !== clip.clipId) {
    surface.setState({ clipId: clip.clipId, frame: 0 })
  }

  const frame = surface.state?.clipId === clip.clipId ? surface.state.frame : 0
  const { done, ahead } = drawWave(clip.levels, surface.columns, frame)

  return (
    <Box>
      <Text color={clip.color}>{done}</Text>
      <Text dimColor>{ahead}</Text>
    </Box>
  )
}

export default Wave
