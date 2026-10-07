import type { ElementTable, RenderElement } from 'claude-code'

import type { NowPlaying } from '../types'
import { waveLook } from './waves'

const WAVE_MAX_COLUMNS = 48
const WAVE_MIN_COLUMNS = 12

export function drawBand(elements: ElementTable, clip: NowPlaying, waveName: string, columns: number, below: RenderElement): RenderElement {
  const { Box, Text } = elements
  const waveColumns = Math.min(WAVE_MAX_COLUMNS, columns)
  const waveElement =
    'Client' in elements && waveColumns >= WAVE_MIN_COLUMNS ? (
      <elements.Client
        key="miod-wave"
        module="./wave.tsx"
        props={{ ...clip, wave: waveName }}
        width={waveColumns}
        height={waveLook(waveName).rows}
      />
    ) : null

  return (
    <Box flexDirection="column">
      <Text color={clip.color} wrap="truncate-end">
        ♪ {clip.label}
      </Text>
      {waveElement}
      {below}
    </Box>
  )
}
