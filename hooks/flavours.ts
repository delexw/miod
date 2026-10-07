import type { Drums, Mood } from './moods'
import type { Style } from './styles'

export type Bass = 'roots' | 'walking' | 'pulse'

export type Flavour = {
  name: string
  style: Style | 'task'
  tempo: number
  brightness: number
  busier: number
  fill: number
  octave: number
  drums: number
  pad: 'mood' | 'always' | 'never'
  swing: number
  bass: Bass
}

export const FLAVOURS: readonly Flavour[] = [
  { name: 'lo-fi', style: 'triangle', tempo: 0.8, brightness: 0, busier: -1, fill: -0.1, octave: 0, drums: 0, pad: 'always', swing: 0.25, bass: 'roots' },
  { name: 'chiptune', style: 'soft-square', tempo: 1.15, brightness: 1, busier: 1, fill: 0.1, octave: 1, drums: 1, pad: 'never', swing: 0, bass: 'pulse' },
  { name: 'ambient', style: 'sine', tempo: 0.7, brightness: 1, busier: -1, fill: -0.2, octave: 1, drums: -2, pad: 'always', swing: 0, bass: 'roots' },
  { name: 'jazzy', style: 'organ', tempo: 1, brightness: 0, busier: 0, fill: 0.1, octave: 0, drums: 0, pad: 'mood', swing: 0.33, bass: 'walking' },
  { name: 'marching', style: 'soft-square', tempo: 1.1, brightness: 0, busier: 0, fill: 0, octave: 0, drums: 1, pad: 'never', swing: 0, bass: 'pulse' },
  { name: 'dreamy', style: 'sine', tempo: 0.85, brightness: 1, busier: 0, fill: 0, octave: 1, drums: -1, pad: 'always', swing: 0.1, bass: 'roots' },
  { name: 'funky', style: 'soft-saw', tempo: 1.05, brightness: 0, busier: 1, fill: 0.15, octave: 0, drums: 1, pad: 'never', swing: 0.2, bass: 'walking' },
  { name: 'minimal', style: 'sine', tempo: 1, brightness: 0, busier: -1, fill: -0.25, octave: 0, drums: -1, pad: 'never', swing: 0, bass: 'roots' },
  { name: 'epic', style: 'soft-saw', tempo: 0.95, brightness: -1, busier: 0, fill: 0.1, octave: -1, drums: 1, pad: 'always', swing: 0, bass: 'pulse' },
  { name: 'music box', style: 'triangle', tempo: 1, brightness: 1, busier: 0, fill: 0, octave: 2, drums: -2, pad: 'never', swing: 0, bass: 'roots' },
  { name: 'sleepy', style: 'sine', tempo: 0.75, brightness: -1, busier: -1, fill: -0.15, octave: -1, drums: -1, pad: 'always', swing: 0.15, bass: 'roots' },
  { name: 'bouncy', style: 'task', tempo: 1.2, brightness: 1, busier: 0, fill: 0.1, octave: 1, drums: 0, pad: 'mood', swing: 0.15, bass: 'walking' },
]

const NOTES_PER_BEAT = [1, 2, 4] as const
const DRUMS: readonly Drums[] = ['none', 'light', 'steady', 'busy']

export function flavourMood(mood: Mood, flavour: Flavour): Mood {
  return {
    ...mood,
    notesPerBeat: stepAlong(NOTES_PER_BEAT, mood.notesPerBeat, flavour.busier),
    fill: Math.max(0, Math.min(0.95, mood.fill + flavour.fill)),
    octave: Math.max(-2, Math.min(2, mood.octave + flavour.octave)),
    drums: stepAlong(DRUMS, mood.drums, flavour.drums),
    pad: flavour.pad === 'mood' ? mood.pad : flavour.pad === 'always',
  }
}

function stepAlong<T>(ladder: readonly T[], value: T, steps: number): T {
  const index = Math.max(0, Math.min(ladder.length - 1, ladder.indexOf(value) + steps))
  return ladder[index] ?? value
}
