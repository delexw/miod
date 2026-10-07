import type { Activity } from './activity'
import { MOODS } from './moods'
import type { Drums, Mood } from './moods'
import { at, seededRandom } from './random'
import { BEATS_PER_PHRASE } from './task'
import type { Task } from './task'
import { midiToFrequency, scaleStepToMidi } from './theory'
import type { ScaleName } from './theory'

export type Moment = {
  activity: Activity
  energy: number
  contextFill: number
  toolCalls: number
  helpers: number
}

export type Voice = 'lead' | 'harmony' | 'bass' | 'pad' | 'hat'

export type Note = {
  start: number
  length: number
  frequency: number
  gain: number
  voice: Voice
}

const HARMONY_STEPS = [2, 4, 7]
const HAT_PATTERN: Record<Drums, number> = { none: 0, light: 0.5, steady: 1, busy: 2 }

export function energyFromRate(tokensPerMinute: number): number {
  if (tokensPerMinute <= 0) {
    return 0
  }
  return Math.min(1, Math.log10(1 + tokensPerMinute) / Math.log10(1 + 20000))
}

export function composePhrase(task: Task, phraseNumber: number, moment: Moment): Note[] {
  const mood = MOODS[moment.activity]
  const random = seededRandom(task.seed ^ Math.imul(phraseNumber + 1, 0x9e3779b1))
  const scale = scaleFor(task, mood)
  const octave = mood.octave + (moment.contextFill > 0.6 ? 1 : 0)
  const notesPerBeat = busierWhenSpendingFast(mood.notesPerBeat, moment.energy)
  const fill = Math.min(0.95, mood.fill + moment.energy * 0.3)
  const beat = 60 / task.tempo

  const melody = writeMelody(task, scale, phraseNumber, octave, notesPerBeat, fill, beat, random)
  const notes: Note[] = [...melody, ...writeBass(task, scale, moment.energy, beat)]

  if (mood.pad) {
    notes.push(...writePad(task, scale, beat))
  }
  notes.push(...writeHarmonies(melody, task, moment.helpers))
  notes.push(...writeDrums(mood.drums, moment.toolCalls, notesPerBeat, beat, random))
  if (mood.clash || moment.contextFill > 0.8) {
    notes.push(writeUneasyDrone(task, beat))
  }

  return notes
}

export function composeFinish(task: Task): Note[] {
  return arpeggio(task, task.homeScale, [0, 2, 4, 7], 0.5, 4)
}

export function composeFixed(task: Task): Note[] {
  return arpeggio(task, 'major', [0, 2, 4, 7, 9], 0.25, 2)
}

function scaleFor(task: Task, mood: Mood): ScaleName {
  return mood.scale === 'home' ? task.homeScale : mood.scale
}

function busierWhenSpendingFast(notesPerBeat: 1 | 2 | 4, energy: number): 1 | 2 | 4 {
  if (energy < 0.66) {
    return notesPerBeat
  }
  return notesPerBeat === 1 ? 2 : 4
}

function writeMelody(
  task: Task,
  scale: ScaleName,
  phraseNumber: number,
  octave: number,
  notesPerBeat: number,
  fill: number,
  beat: number,
  random: () => number,
): Note[] {
  const slot = beat / notesPerBeat
  const notes: Note[] = []
  let step = 0

  for (let i = 0; i < BEATS_PER_PHRASE * notesPerBeat; i++) {
    const isOnBeat = i % notesPerBeat === 0
    step = isOnBeat ? at(task.theme, phraseNumber + i / notesPerBeat) : step + Math.floor(random() * 5) - 2
    if (isOnBeat || random() < fill) {
      notes.push({
        start: i * slot,
        length: slot * (isOnBeat ? 1.6 : 0.9),
        frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step) + octave * 12),
        gain: isOnBeat ? 0.32 : 0.22,
        voice: 'lead',
      })
    }
  }

  return notes
}

function writeBass(task: Task, scale: ScaleName, energy: number, beat: number): Note[] {
  const steps = energy > 0.5 ? [0, 4, 0, 4] : [0, 0]
  const length = (BEATS_PER_PHRASE * beat) / steps.length

  return steps.map((step, i) => ({
    start: i * length,
    length: length * 0.95,
    frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step) - 24),
    gain: 0.35,
    voice: 'bass',
  }))
}

function writePad(task: Task, scale: ScaleName, beat: number): Note[] {
  return [0, 2, 4].map(step => ({
    start: 0,
    length: BEATS_PER_PHRASE * beat,
    frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step) - 12),
    gain: 0.07,
    voice: 'pad',
  }))
}

function writeHarmonies(melody: readonly Note[], task: Task, helpers: number): Note[] {
  const voices = HARMONY_STEPS.slice(0, Math.min(helpers, HARMONY_STEPS.length))

  return voices.flatMap(step =>
    melody
      .filter((_, i) => i % 2 === 0)
      .map(note => ({
        ...note,
        frequency: note.frequency * 2 ** (scaleStepToMidi(0, task.homeScale, step) / 12),
        gain: note.gain * 0.45,
        voice: 'harmony' as const,
      })),
  )
}

function writeDrums(drums: Drums, toolCalls: number, notesPerBeat: number, beat: number, random: () => number): Note[] {
  const hitsPerBeat = HAT_PATTERN[drums]
  const notes: Note[] = []

  if (hitsPerBeat > 0) {
    const gap = beat / hitsPerBeat
    for (let i = 0; i < BEATS_PER_PHRASE * hitsPerBeat; i++) {
      notes.push(hat(i * gap, i % hitsPerBeat === 0 ? 0.14 : 0.08))
    }
  }

  const slot = beat / notesPerBeat
  for (let i = 0; i < Math.min(16, toolCalls * 2); i++) {
    notes.push(hat(Math.floor(random() * BEATS_PER_PHRASE * notesPerBeat) * slot, 0.12))
  }

  return notes
}

function writeUneasyDrone(task: Task, beat: number): Note {
  return {
    start: 0,
    length: BEATS_PER_PHRASE * beat,
    frequency: midiToFrequency(task.root - 18),
    gain: 0.08,
    voice: 'bass',
  }
}

function arpeggio(task: Task, scale: ScaleName, steps: readonly number[], gapBeats: number, holdBeats: number): Note[] {
  const beat = 60 / task.tempo

  return steps.map((step, i) => ({
    start: i * beat * gapBeats,
    length: beat * holdBeats,
    frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step)),
    gain: 0.25,
    voice: 'lead',
  }))
}

function hat(start: number, gain: number): Note {
  return { start, length: 0.05, frequency: 0, gain, voice: 'hat' }
}
