import type { ElementTable, RenderElement } from 'claude-code'

import type { NowPlaying } from '../types'
import { waveLook } from './waves'

const WAVE_MAX_COLUMNS = 48
const WAVE_MIN_COLUMNS = 12

export function drawBand(elements: ElementTable, clip: NowPlaying, waveName: string, columns: number, below: RenderElement): RenderElement {
  const { Box, Text } = elements
  const label = `♪ ${clip.label} `
  const waveColumns = Math.min(WAVE_MAX_COLUMNS, columns - label.length)
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
      <Box>
        <Box flexShrink={0}>
          <Text color={clip.color}>{label}</Text>
        </Box>
        {waveElement}
      </Box>
      {below}
    </Box>
  )
}
