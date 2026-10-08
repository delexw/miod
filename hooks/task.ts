import { FLAVOURS } from './flavours'
import type { Flavour } from './flavours'
import { hashText, pick, seededRandom } from './random'
import { STYLE_NAMES } from './styles'
import type { Style } from './styles'
import { noteName, PROGRESSIONS, RELATED_KEY_STEPS } from './theory'
import type { ScaleName } from './theory'

export type Task = {
  seed: number
  root: number
  tempo: number
  style: Style
  flavour: Flavour
  progression: readonly number[]
  theme: readonly number[]
}

export const BEATS_PER_PHRASE = 8

const LOWEST_ROOT = 57

export function startTask(prompt: string, startedAt: number, previous?: Task): Task {
  const seed = hashText(`${startedAt}:${prompt}`)
  const random = seededRandom(seed)
  const freshRoot = LOWEST_ROOT + Math.floor(random() * 12)
  const root = previous ? keyNear(previous.root + pick(random, RELATED_KEY_STEPS)) : freshRoot
  const tempo = 84 + Math.floor(random() * 48)
  const style = pick(random, STYLE_NAMES)
  const theme = Array.from({ length: 8 }, () => Math.floor(random() * 9) - 2)
  const flavour = pick(random, FLAVOURS)
  const progression = pick(random, PROGRESSIONS)

  return {
    seed,
    root,
    tempo: Math.round(tempo * flavour.tempo),
    style: flavour.style === 'task' ? style : flavour.style,
    flavour,
    progression,
    theme,
  }
}

function keyNear(midi: number): number {
  return LOWEST_ROOT + (((midi - LOWEST_ROOT) % 12) + 12) % 12
}

export function describeTask(task: Task, scale: ScaleName): string {
  return `${task.flavour.name} · ${noteName(task.root)} ${scale} · ${task.tempo} bpm`
}

export function phraseSeconds(task: Task): number {
  return (BEATS_PER_PHRASE * 60) / task.tempo
}
