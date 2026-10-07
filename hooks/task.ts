import { hashText, pick, seededRandom } from './random'
import { noteName, SCALES } from './theory'
import type { ScaleName } from './theory'

export type Sound = 'sine' | 'triangle' | 'soft-square'

export type Task = {
  seed: number
  root: number
  homeScale: ScaleName
  tempo: number
  sound: Sound
  theme: readonly number[]
}

export const BEATS_PER_PHRASE = 8

export function startTask(prompt: string, startedAt: number): Task {
  const seed = hashText(`${startedAt}:${prompt}`)
  const random = seededRandom(seed)

  return {
    seed,
    root: 57 + Math.floor(random() * 12),
    homeScale: pick(random, Object.keys(SCALES) as ScaleName[]),
    tempo: 84 + Math.floor(random() * 48),
    sound: pick(random, ['sine', 'triangle', 'soft-square'] as const),
    theme: Array.from({ length: 8 }, () => Math.floor(random() * 9) - 2),
  }
}

export function describeTask(task: Task): string {
  return `${noteName(task.root)} ${task.homeScale}, ${task.tempo} bpm`
}

export function phraseSeconds(task: Task): number {
  return (BEATS_PER_PHRASE * 60) / task.tempo
}
