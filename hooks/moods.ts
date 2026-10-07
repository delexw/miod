import type { Activity } from './activity'
import type { ScaleName } from './theory'

export type Drums = 'none' | 'light' | 'steady' | 'busy'

export type Mood = {
  feel: string
  color: string
  scale: 'home' | ScaleName
  notesPerBeat: 1 | 2 | 4
  fill: number
  octave: number
  drums: Drums
  pad: boolean
  clash: boolean
}

export const MOODS: Record<Activity, Mood> = {
  thinking: { feel: 'calm', color: '#8FA3BF', scale: 'home', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
  reading: { feel: 'airy', color: '#7FB3D5', scale: 'home', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
  exploring: { feel: 'curious', color: '#A78BFA', scale: 'lydian', notesPerBeat: 2, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
  planning: { feel: 'hopeful', color: '#F5C26B', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'light', pad: true, clash: false },
  asking: { feel: 'waiting', color: '#B0BEC5', scale: 'lydian', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
  editing: { feel: 'bright', color: '#F5A623', scale: 'major', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
  running: { feel: 'driving', color: '#4FC3F7', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
  installing: { feel: 'patient', color: '#90A4AE', scale: 'minor pentatonic', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
  testing: { feel: 'focused', color: '#26C6DA', scale: 'dorian', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'busy', pad: false, clash: false },
  shipping: { feel: 'triumphant', color: '#FFD54F', scale: 'mixolydian', notesPerBeat: 4, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
  deleting: { feel: 'ominous', color: '#E57373', scale: 'phrygian', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
  delegating: { feel: 'layered', color: '#81C784', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
  failing: { feel: 'tense', color: '#EF5350', scale: 'minor', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: true },
}
