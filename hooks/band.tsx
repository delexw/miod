import type { ElementTable, RenderElement } from 'claude-code'

import type { NowPlaying } from '../types'
import { waveLook } from './waves'

export function drawBand(elements: ElementTable, clip: NowPlaying, waveName: string, below: RenderElement): RenderElement {
  const { Box, Text } = elements
  const waveElement =
    'Client' in elements ? (
      <elements.Client key="miod-wave" module="./wave.tsx" props={{ ...clip, wave: waveName }} height={waveLook(waveName).rows} flexGrow={1} />
    ) : null

  return (
    <Box flexDirection="column">
      <Box>
        <Box flexShrink={0}>
          <Text color={clip.color}>♪ {clip.label} </Text>
        </Box>
        {waveElement}
      </Box>
      {below}
    </Box>
  )
}
