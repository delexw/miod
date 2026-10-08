import { flavourMood } from './flavours'
import type { Bass } from './flavours'
import type { Drums, Mood } from './moods'
import { at, seededRandom } from './random'
import { BEATS_PER_PHRASE } from './task'
import type { Task } from './task'
import { brighten, midiToFrequency, scaleStepToMidi } from './theory'
import type { ScaleName } from './theory'

export type Moment = {
  mood: Mood
  scale: ScaleName
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
  const mood = flavourMood(moment.mood, task.flavour)
  const random = seededRandom(task.seed ^ Math.imul(phraseNumber + 1, 0x9e3779b1))
  const scale = soundingScale(task, moment.scale)
  const octave = mood.octave + (moment.contextFill > 0.6 ? 1 : 0)
  const notesPerBeat = busierWhenSpendingFast(mood.notesPerBeat, moment.energy)
  const fill = Math.min(0.95, mood.fill + moment.energy * 0.3)
  const beat = 60 / task.tempo

  const melody = writeMelody(task, scale, phraseNumber, octave, notesPerBeat, fill, beat, random)
  const notes: Note[] = [...melody, ...writeBass(task, scale, task.flavour.bass, moment.energy, beat)]

  if (mood.pad) {
    notes.push(...writePad(task, scale, beat))
  }
  notes.push(...writeHarmonies(melody, scale, moment.helpers))
  notes.push(...writeDrums(mood.drums, moment.toolCalls, notesPerBeat, beat, random))
  if (mood.clash || moment.contextFill > 0.8) {
    notes.push(writeUneasyDrone(task, beat))
  }

  return notes
}

export function soundingScale(task: Task, scale: ScaleName): ScaleName {
  return brighten(scale, task.flavour.brightness)
}

export function composeFinish(task: Task, scale: ScaleName): Note[] {
  return arpeggio(task, scale, [0, 2, 4, 7], 0.5, BEATS_PER_PHRASE)
}

export function composeFixed(task: Task): Note[] {
  return arpeggio(task, 'major', [0, 2, 4, 7, 9], 0.25, 2)
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
  const swing = notesPerBeat > 1 ? slot * task.flavour.swing : 0
  const notes: Note[] = []
  let step = 0

  for (let i = 0; i < BEATS_PER_PHRASE * notesPerBeat; i++) {
    const isOnBeat = i % notesPerBeat === 0
    const beatNumber = i / notesPerBeat
    step = isOnBeat ? at(task.theme, phraseNumber + beatNumber) + chordAt(task, beatNumber) : step + Math.floor(random() * 5) - 2
    if (isOnBeat || random() < fill) {
      notes.push({
        start: i * slot + (i % 2 === 1 ? swing : 0),
        length: slot * (isOnBeat ? 1.6 : 0.9),
        frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step) + octave * 12),
        gain: isOnBeat ? 0.32 : 0.22,
        voice: 'lead',
      })
    }
  }

  return notes
}

const BASS_LINES: Record<Bass, { calm: readonly number[]; busy: readonly number[]; hold: number }> = {
  roots: { calm: [0, 0], busy: [0, 4, 0, 4], hold: 0.95 },
  walking: { calm: [0, 2, 4, 5], busy: [0, 2, 4, 5, 4, 2, 1, 0], hold: 0.9 },
  pulse: { calm: [0, 0, 0, 0, 0, 0, 0, 0], busy: [0, 0, 4, 4, 0, 0, 4, 4], hold: 0.4 },
}

function writeBass(task: Task, scale: ScaleName, bass: Bass, energy: number, beat: number): Note[] {
  const line = BASS_LINES[bass]
  const steps = energy > 0.5 ? line.busy : line.calm
  const length = (BEATS_PER_PHRASE * beat) / steps.length

  return steps.map((step, i) => ({
    start: i * length,
    length: length * line.hold,
    frequency: midiToFrequency(scaleStepToMidi(task.root, scale, step + chordAt(task, (i * length) / beat)) - 24),
    gain: 0.35,
    voice: 'bass',
  }))
}

function writePad(task: Task, scale: ScaleName, beat: number): Note[] {
  const beatsPerChord = BEATS_PER_PHRASE / task.progression.length

  return task.progression.flatMap((chord, i) =>
    [0, 2, 4].map(step => ({
      start: i * beatsPerChord * beat,
      length: beatsPerChord * beat,
      frequency: midiToFrequency(scaleStepToMidi(task.root, scale, chord + step) - 12),
      gain: 0.07,
      voice: 'pad' as const,
    })),
  )
}

function chordAt(task: Task, beatNumber: number): number {
  const beatsPerChord = BEATS_PER_PHRASE / task.progression.length
  return at(task.progression, Math.floor(beatNumber / beatsPerChord))
}

function writeHarmonies(melody: readonly Note[], scale: ScaleName, helpers: number): Note[] {
  const voices = HARMONY_STEPS.slice(0, Math.min(helpers, HARMONY_STEPS.length))

  return voices.flatMap(step =>
    melody
      .filter((_, i) => i % 2 === 0)
      .map(note => ({
        ...note,
        frequency: note.frequency * 2 ** (scaleStepToMidi(0, scale, step) / 12),
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
