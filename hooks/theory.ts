import { at } from './random'

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  'major pentatonic': [0, 2, 4, 7, 9],
  'minor pentatonic': [0, 3, 5, 7, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic minor': [0, 2, 3, 5, 7, 9, 11],
  blues: [0, 3, 5, 6, 7, 10],
  'whole tone': [0, 2, 4, 6, 8, 10],
  hirajoshi: [0, 2, 3, 7, 8],
  'in sen': [0, 1, 5, 7, 10],
  'double harmonic': [0, 1, 4, 5, 7, 8, 11],
  egyptian: [0, 2, 5, 7, 10],
} as const

export type ScaleName = keyof typeof SCALES

export const SCALE_NAMES = Object.keys(SCALES) as ScaleName[]

export const PROGRESSIONS: readonly (readonly number[])[] = [
  [0, 4, 5, 3],
  [0, 5, 3, 4],
  [5, 3, 0, 4],
  [0, 3, 4, 3],
  [0, 6, 5, 4],
  [0, 3, 0, 4],
  [1, 4, 0, 0],
  [0, 2, 5, 4],
  [0, 0, 3, 3],
  [0, 5, 1, 4],
]

export const RELATED_KEY_STEPS = [0, 5, 7, -5, -7]

const DARK_TO_BRIGHT: readonly ScaleName[] = [
  'phrygian',
  'minor',
  'minor pentatonic',
  'dorian',
  'mixolydian',
  'major pentatonic',
  'major',
  'lydian',
]

export function brighten(scale: ScaleName, steps: number): ScaleName {
  const position = DARK_TO_BRIGHT.indexOf(scale)
  if (position === -1) {
    return scale
  }
  const index = Math.max(0, Math.min(DARK_TO_BRIGHT.length - 1, position + steps))
  return DARK_TO_BRIGHT[index] ?? scale
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function noteName(midi: number): string {
  return at(NOTE_NAMES, midi)
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function scaleStepToMidi(root: number, scale: ScaleName, step: number): number {
  const notes = SCALES[scale]
  const octave = Math.floor(step / notes.length)
  return root + octave * 12 + at(notes, step)
}
