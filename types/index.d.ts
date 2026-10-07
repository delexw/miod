export type NowPlaying = {
  clipId: number
  label: string
  color: string
  levels: number[]
  pointsPerSecond: number
}

export type WaveProps = NowPlaying & { wave: string }

declare module 'claude-code' {
  interface PluginState {
    miod: { isEnabled: boolean; nowPlaying: NowPlaying | null; wave: string }
  }
}
