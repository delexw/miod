import type { ElementTable, RenderElement } from 'claude-code'

import type { NowPlaying } from '../types'

export function drawBand(elements: ElementTable, clip: NowPlaying, below: RenderElement): RenderElement {
  const { Box, Text } = elements
  const wave =
    'Client' in elements ? (
      <elements.Client key="miod-wave" module="./wave.tsx" props={clip} height={1} flexGrow={1} />
    ) : null

  return (
    <Box flexDirection="column">
      <Box>
        <Box flexShrink={0}>
          <Text color={clip.color}>♪ {clip.label} </Text>
        </Box>
        {wave}
      </Box>
      {below}
    </Box>
  )
}
