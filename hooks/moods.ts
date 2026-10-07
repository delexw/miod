import type { Activity } from './activity'
import type { ScaleName } from './theory'

export type Drums = 'none' | 'light' | 'steady' | 'busy'

export type Mood = {
  feel: string
  scale: 'home' | ScaleName
  notesPerBeat: 1 | 2 | 4
  fill: number
  octave: number
  drums: Drums
  pad: boolean
  clash: boolean
}

export const MOODS: Record<Activity, Mood> = {
  thinking: { feel: 'calm', scale: 'home', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
  reading: { feel: 'airy', scale: 'home', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
  editing: { feel: 'bright', scale: 'major', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
  running: { feel: 'driving', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
  testing: { feel: 'focused', scale: 'dorian', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'busy', pad: false, clash: false },
  delegating: { feel: 'layered', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
  failing: { feel: 'tense', scale: 'minor', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: true },
}
