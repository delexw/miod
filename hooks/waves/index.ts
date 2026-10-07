import { bars } from './bars'
import { dots } from './dots'
import { line } from './line'
import { mirror } from './mirror'
import { pulse } from './pulse'
import type { WaveLook } from './shared'

export const WAVES = { bars, line, mirror, dots, pulse } satisfies Record<string, WaveLook>

export type WaveName = keyof typeof WAVES

export const WAVE_NAMES = Object.keys(WAVES) as WaveName[]

export const DEFAULT_WAVE: WaveName = 'bars'

export function isWaveName(name: string): name is WaveName {
  return (WAVE_NAMES as string[]).includes(name)
}

export function waveLook(name: string): WaveLook {
  return isWaveName(name) ? WAVES[name] : WAVES[DEFAULT_WAVE]
}
