import { hashText, pick, seededRandom } from './random'
import { STYLE_NAMES } from './styles'
import type { Style } from './styles'
import { noteName } from './theory'
import type { ScaleName } from './theory'

export type Task = {
  seed: number
  root: number
  homeScale: ScaleName
  tempo: number
  style: Style
  theme: readonly number[]
}

export const BEATS_PER_PHRASE = 8

const HOME_SCALES: readonly ScaleName[] = ['major', 'minor', 'dorian', 'mixolydian', 'major pentatonic', 'minor pentatonic']

export function startTask(prompt: string, startedAt: number): Task {
  const seed = hashText(`${startedAt}:${prompt}`)
  const random = seededRandom(seed)

  return {
    seed,
    root: 57 + Math.floor(random() * 12),
    homeScale: pick(random, HOME_SCALES),
    tempo: 84 + Math.floor(random() * 48),
    style: pick(random, STYLE_NAMES),
    theme: Array.from({ length: 8 }, () => Math.floor(random() * 9) - 2),
  }
}

export function describeTask(task: Task): string {
  return `${noteName(task.root)} ${task.homeScale}, ${task.tempo} bpm`
}

export function phraseSeconds(task: Task): number {
  return (BEATS_PER_PHRASE * 60) / task.tempo
}
