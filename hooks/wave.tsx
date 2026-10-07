import type { ClientModule } from 'claude-code'

import type { WaveProps } from '../types'
import { waveLook } from './waves'

type WaveState = { clipId: number; frame: number }

const Wave: ClientModule<WaveProps, WaveState> = (clip, surface) => {
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
  const rows = waveLook(clip.wave).draw(clip.levels, surface.columns, frame)

  return (
    <Box flexDirection="column">
      {rows.map(({ done, ahead }) => (
        <Box>
          <Text color={clip.color}>{done}</Text>
          <Text dimColor>{ahead}</Text>
        </Box>
      ))}
    </Box>
  )
}

export default Wave
