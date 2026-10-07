import { at } from './random'

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  'major pentatonic': [0, 2, 4, 7, 9],
  'minor pentatonic': [0, 3, 5, 7, 10],
} as const

export type ScaleName = keyof typeof SCALES

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
