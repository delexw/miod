import { describe, expect, test } from 'claude-code/testing'

import { activityForCommand, activityForTool, STRONGEST_FIRST, strongestActivity } from '../hooks/activity'
import { composeFinish, composeFixed, composePhrase, energyFromRate } from '../hooks/compose'
import type { Moment } from '../hooks/compose'
import { MOOD_SCALES, MOODS } from '../hooks/moods'
import { nextMood, PHRASES_PER_VARIANT } from '../hooks/moods'
import type { Mood } from '../hooks/moods'
import type { Activity } from '../hooks/activity'
import { pickWeighted, seededRandom } from '../hooks/random'
import { STYLE_NAMES, STYLES } from '../hooks/styles'
import { loudness, renderClip, SAMPLE_RATE, TAIL_SECONDS, toBase64, WAVE_POINTS_PER_SECOND } from '../hooks/synth'
import { FLAVOURS, flavourMood } from '../hooks/flavours'
import type { Flavour } from '../hooks/flavours'
import { describeTask, startTask } from '../hooks/task'
import type { Task } from '../hooks/task'
import { brighten, PROGRESSIONS, SCALE_NAMES, SCALES } from '../hooks/theory'
import type { ScaleName } from '../hooks/theory'

const NEUTRAL: Flavour = {
  name: 'neutral',
  style: 'task',
  tempo: 1,
  brightness: 0,
  busier: 0,
  fill: 0,
  octave: 0,
  drums: 0,
  pad: 'mood',
  swing: 0,
  bass: 'roots',
}

const FIRST_MOODS = Object.fromEntries(
  Object.entries(MOODS).map(([activity, variants]) => [activity, variants[0]]),
) as Record<Activity, Mood>

const firstScale = (activity: Activity): ScaleName => Object.keys(MOOD_SCALES[activity])[0] as ScaleName

const plain = (prompt: string, startedAt: number): Task => ({
  ...startTask(prompt, startedAt),
  flavour: NEUTRAL,
  progression: [0, 0, 0, 0],
})

const moment = ({ activity = 'thinking', ...overrides }: Partial<Moment> & { activity?: Activity } = {}): Moment => ({
  mood: FIRST_MOODS[activity],
  scale: firstScale(activity),
  energy: 0.1,
  contextFill: 0,
  toolCalls: 0,
  helpers: 0,
  ...overrides,
})

const count = (notes: { voice: string }[], voice: string) => notes.filter(note => note.voice === voice).length

describe('what the agent is doing', () => {
  test('tools map to activities', async () => {
    expect(activityForTool('Read')).toBe('reading')
    expect(activityForTool('Grep')).toBe('reading')
    expect(activityForTool('Edit')).toBe('editing')
    expect(activityForTool('Agent')).toBe('delegating')
    expect(activityForCommand('bun run test')).toBe('testing')
    expect(activityForCommand('git status')).toBe('running')
    expect(activityForTool('WebSearch')).toBe('exploring')
    expect(activityForTool('TodoWrite')).toBe('planning')
    expect(activityForTool('AskUserQuestion')).toBe('asking')
    expect(activityForCommand('git commit -m "done"')).toBe('shipping')
    expect(activityForCommand('gh pr create --fill')).toBe('shipping')
    expect(activityForCommand('rm -rf dist')).toBe('deleting')
    expect(activityForCommand('git reset --hard')).toBe('deleting')
    expect(activityForCommand('bun install')).toBe('installing')
    expect(activityForCommand('pip install requests')).toBe('installing')
  })

  test('every mood has a place in the strongest-first order', async () => {
    const moods = Object.keys(MOODS).sort()

    expect([...STRONGEST_FIRST].sort()).toEqual(moods)
  })

  test('the strongest activity in a phrase wins', async () => {
    expect(strongestActivity(['reading', 'editing', 'reading'])).toBe('editing')
    expect(strongestActivity(['reading', 'testing'])).toBe('testing')
    expect(strongestActivity([])).toBe('thinking')
  })
})

describe('music', () => {
  test('each task gets its own music', async () => {
    const first = startTask('fix the login bug', 1000)
    const second = startTask('write the release notes', 1000)

    expect(composePhrase(first, 0, moment())).not.toEqual(composePhrase(second, 0, moment()))
    expect(first.seed).not.toBe(startTask('fix the login bug', 2000).seed)
  })

  test('the same task and moment always compose the same phrase', async () => {
    const task = startTask('fix the login bug', 1000)

    expect(composePhrase(task, 3, moment({ activity: 'editing' }))).toEqual(
      composePhrase(startTask('fix the login bug', 1000), 3, moment({ activity: 'editing' })),
    )
  })

  test('heavier token use plays more melody notes', async () => {
    const task = plain('refactor the parser', 5000)
    const lead = (energy: number) => count(composePhrase(task, 0, moment({ activity: 'editing', energy })), 'lead')

    expect(lead(0.9)).toBeGreaterThan(lead(0.1))
  })

  test('reading is quiet with a pad, testing has a busy beat', async () => {
    const task = plain('investigate', 5000)
    const reading = composePhrase(task, 0, moment({ activity: 'reading' }))
    const testing = composePhrase(task, 0, moment({ activity: 'testing' }))

    expect(count(reading, 'pad')).toBe(12)
    expect(count(reading, 'hat')).toBe(0)
    expect(count(testing, 'hat')).toBe(16)
  })

  test('failing adds an uneasy low drone', async () => {
    const task = plain('investigate', 5000)
    const calmBass = count(composePhrase(task, 0, moment({ activity: 'running' })), 'bass')
    const failingBass = count(composePhrase(task, 0, moment({ activity: 'failing' })), 'bass')

    expect(failingBass).toBe(calmBass + 1)
  })

  test('each running subagent adds a harmony layer', async () => {
    const task = plain('fan out', 5000)
    const one = count(composePhrase(task, 0, moment({ activity: 'delegating', helpers: 1 })), 'harmony')
    const two = count(composePhrase(task, 0, moment({ activity: 'delegating', helpers: 2 })), 'harmony')

    expect(one).toBeGreaterThan(0)
    expect(two).toBe(one * 2)
  })

  test('finish and fixed phrases are short rising arpeggios', async () => {
    const task = startTask('anything', 0)

    expect(composeFinish(task, 'major').length).toBe(4)
    expect(composeFixed(task).length).toBe(5)
  })

  test('energy grows with the token rate and stays between 0 and 1', async () => {
    expect(energyFromRate(0)).toBe(0)
    expect(energyFromRate(500)).toBeLessThan(energyFromRate(5000))
    expect(energyFromRate(1_000_000)).toBe(1)
  })

  test('every style is a wave that stays between -1 and 1', async () => {
    for (const style of STYLE_NAMES) {
      for (let i = 0; i < 100; i++) {
        const value = STYLES[style](i / 37)
        expect(value).toBeGreaterThanOrEqual(-1)
        expect(value).toBeLessThanOrEqual(1)
      }
    }
  })

  test('each task picks one of the styles', async () => {
    expect(STYLE_NAMES).toContain(startTask('anything', 0).style)
  })

  test('renders a mono 16-bit WAV of the right length', async () => {
    const task = startTask('anything', 0)
    const bytes = renderClip(task.style, composePhrase(task, 0, moment()), 1, task.seed).wav
    const text = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4))

    expect(text(0)).toBe('RIFF')
    expect(text(8)).toBe('WAVE')
    expect(bytes.length).toBe(44 + Math.ceil((1 + TAIL_SECONDS) * SAMPLE_RATE) * 2)
    expect(toBase64(bytes).startsWith('UklGR')).toBe(true)
  })

  test('fixed and finished phrases differ per task', async () => {
    expect(composeFinish(startTask('a', 1), 'major')).not.toEqual(composeFinish(startTask('b', 2), 'major'))
  })
})

describe('variety', () => {
  test('every mood has at least 10 variants, each with its own feel', async () => {
    for (const variants of Object.values(MOODS)) {
      expect(variants.length).toBeGreaterThanOrEqual(10)
      expect(new Set(variants.map(variant => variant.feel)).size).toBe(variants.length)
    }
  })

  test('a variant holds for a few phrases, then a new one is picked as the task goes', async () => {
    const random = seededRandom(7)
    let choice = nextMood(null, 'editing', random)
    const first = choice.mood
    for (let i = 1; i < PHRASES_PER_VARIANT; i++) {
      choice = nextMood(choice, 'editing', random)
      expect(choice.mood).toBe(first)
    }

    const feels = new Set<string>()
    for (let i = 0; i < 200; i++) {
      choice = nextMood(choice, 'editing', random)
      feels.add(choice.mood.feel)
    }
    expect(feels.size).toBeGreaterThanOrEqual(8)
  })

  test('changing activity picks a variant of the new mood straight away', async () => {
    const random = seededRandom(7)
    const editing = nextMood(null, 'editing', random)
    const testing = nextMood(editing, 'testing', random)

    expect(MOODS.testing).toContain(testing.mood)
    expect(testing.phrases).toBe(1)
  })

  test('there are at least 10 flavours, each with its own name', async () => {
    const names = FLAVOURS.map(flavour => flavour.name)

    expect(names.length).toBeGreaterThanOrEqual(10)
    expect(new Set(names).size).toBe(names.length)
  })

  test('each task picks a flavour and a progression', async () => {
    const task = startTask('anything', 42)

    expect(FLAVOURS).toContain(task.flavour)
    expect(PROGRESSIONS).toContain(task.progression)
  })

  test('the status line names the scale that is playing', async () => {
    expect(describeTask(startTask('anything', 42), 'dorian')).toContain(' dorian · ')
  })

  test('different tasks land on many different flavours', async () => {
    const picked = new Set(Array.from({ length: 200 }, (_, i) => startTask('same prompt', i).flavour.name))

    expect(picked.size).toBeGreaterThanOrEqual(10)
  })

  test('the same mood sounds different under different flavours', async () => {
    const task = plain('investigate', 5000)
    const editing = moment({ activity: 'editing' })
    const phrases = FLAVOURS.map(flavour => JSON.stringify(composePhrase({ ...task, flavour }, 0, editing)))

    expect(new Set(phrases).size).toBe(FLAVOURS.length)
  })

  test('a flavour nudges a mood and keeps it in range', async () => {
    const chiptune = FLAVOURS.find(flavour => flavour.name === 'chiptune')
    const ambient = FLAVOURS.find(flavour => flavour.name === 'ambient')
    if (!chiptune || !ambient) {
      throw new Error('missing flavour')
    }

    expect(flavourMood(FIRST_MOODS.editing, chiptune).notesPerBeat).toBe(4)
    expect(flavourMood(FIRST_MOODS.shipping, chiptune).notesPerBeat).toBe(4)
    expect(flavourMood(FIRST_MOODS.running, ambient).drums).toBe('none')
    expect(flavourMood(FIRST_MOODS.testing, ambient).drums).toBe('light')
    expect(flavourMood(FIRST_MOODS.reading, ambient).pad).toBe(true)
  })

  test('every scale climbs within one octave', async () => {
    for (const name of SCALE_NAMES) {
      const notes = SCALES[name]
      expect(notes[0]).toBe(0)
      expect(notes.every((note, i) => i === 0 || note > (notes[i - 1] ?? -1))).toBe(true)
      expect(Math.max(...notes)).toBeLessThan(12)
    }
  })

  test('brightening moves along the light ladder and leaves other scales alone', async () => {
    expect(brighten('minor', 1)).toBe('minor pentatonic')
    expect(brighten('lydian', 5)).toBe('lydian')
    expect(brighten('blues', 1)).toBe('blues')
  })

  test('the next task starts in a related key', async () => {
    const first = startTask('first task', 1)
    for (let i = 0; i < 50; i++) {
      const next = startTask(`next ${i}`, i, first)
      expect([0, 5, 7]).toContain((((next.root - first.root) % 12) + 12) % 12)
    }
  })

  test('a clip never goes past the safe peak, so busy phrases do not distort', async () => {
    const task = plain('busy', 0)
    const busy = composePhrase({ ...task, flavour: { ...NEUTRAL, busier: 2 } }, 0, moment({ activity: 'shipping', energy: 1, helpers: 3, toolCalls: 8 }))
    const wav = renderClip(task.style, busy, 4, task.seed).wav
    const view = new DataView(wav.buffer)
    let peak = 0
    for (let i = 44; i < wav.length; i += 2) {
      peak = Math.max(peak, Math.abs(view.getInt16(i, true)) / 32767)
    }

    expect(peak).toBeLessThanOrEqual(0.71)
  })

  test('a fade in starts silent and a fade out ends silent', async () => {
    const task = plain('anything', 0)
    const notes = composePhrase(task, 0, moment({ activity: 'editing' }))
    const unfaded = renderClip(task.style, notes, 2, task.seed).levels
    const fadedIn = renderClip(task.style, notes, 2, task.seed, { inSeconds: 1 }).levels
    const fadedOut = renderClip(task.style, notes, 2, task.seed, { outSeconds: 2 + TAIL_SECONDS }).levels
    const last = unfaded.length - 1

    expect(fadedIn[0] ?? 1).toBeLessThan((unfaded[0] ?? 0) * 0.2)
    expect(fadedOut[last] ?? 1).toBeLessThan((unfaded[last] ?? 0) * 0.5)
  })
})

describe('scales by mood', () => {
  test('a weighted pick follows its weights and never picks a zero weight', async () => {
    const random = seededRandom(11)
    const picks = Array.from({ length: 4000 }, () => pickWeighted(random, { often: 3, rarely: 1, never: 0 }))
    const often = picks.filter(name => name === 'often').length / picks.length

    expect(often).toBeGreaterThan(0.7)
    expect(often).toBeLessThan(0.8)
    expect(picks).not.toContain('never')
  })

  test('every mood weighs its own scales, and every scale belongs to at least one mood', async () => {
    for (const weights of Object.values(MOOD_SCALES)) {
      expect(Object.keys(weights).length).toBeGreaterThan(0)
      expect(Object.values(weights).every(weight => weight > 0)).toBe(true)
    }
    const used = new Set(Object.values(MOOD_SCALES).flatMap(weights => Object.keys(weights)))
    expect([...used].sort()).toEqual([...SCALE_NAMES].sort())
  })

  test('the mood picks the scale from its own table and keeps it while the variant holds', async () => {
    const random = seededRandom(3)
    let choice = nextMood(null, 'failing', random)
    const first = choice.scale
    for (let i = 1; i < PHRASES_PER_VARIANT; i++) {
      choice = nextMood(choice, 'failing', random)
      expect(choice.scale).toBe(first)
    }

    for (const activity of Object.keys(MOOD_SCALES) as Activity[]) {
      const scales = new Set(Array.from({ length: 300 }, () => nextMood(null, activity, random).scale))
      expect([...scales].every(scale => scale in MOOD_SCALES[activity])).toBe(true)
      expect(scales.size).toBeGreaterThan(1)
    }
  })

  test('failing never sounds bright and shipping never sounds dark', async () => {
    const random = seededRandom(5)
    const failing = new Set(Array.from({ length: 300 }, () => nextMood(null, 'failing', random).scale))
    const shipping = new Set(Array.from({ length: 300 }, () => nextMood(null, 'shipping', random).scale))

    for (const bright of ['major', 'lydian', 'major pentatonic', 'mixolydian'] as const) {
      expect(failing.has(bright)).toBe(false)
    }
    for (const dark of ['minor', 'phrygian', 'harmonic minor'] as const) {
      expect(shipping.has(dark)).toBe(false)
    }
  })
})
