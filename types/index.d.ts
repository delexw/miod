export type NowPlaying = {
  clipId: number
  label: string
  color: string
  levels: number[]
  pointsPerSecond: number
}

declare module 'claude-code' {
  interface PluginState {
    miod: { isEnabled: boolean; nowPlaying: NowPlaying | null }
  }
}
