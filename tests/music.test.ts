import { describe, expect, test } from 'claude-code/testing'

import { activityForCommand, activityForTool, strongestActivity } from '../hooks/activity'
import { composeFinish, composeFixed, composePhrase, energyFromRate } from '../hooks/compose'
import type { Moment } from '../hooks/compose'
import { renderWav, SAMPLE_RATE, toBase64 } from '../hooks/synth'
import { startTask } from '../hooks/task'

const moment = (overrides: Partial<Moment> = {}): Moment => ({
  activity: 'thinking',
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
    const task = startTask('refactor the parser', 5000)
    const lead = (energy: number) => count(composePhrase(task, 0, moment({ activity: 'editing', energy })), 'lead')

    expect(lead(0.9)).toBeGreaterThan(lead(0.1))
  })

  test('reading is quiet with a pad, testing has a busy beat', async () => {
    const task = startTask('investigate', 5000)
    const reading = composePhrase(task, 0, moment({ activity: 'reading' }))
    const testing = composePhrase(task, 0, moment({ activity: 'testing' }))

    expect(count(reading, 'pad')).toBe(3)
    expect(count(reading, 'hat')).toBe(0)
    expect(count(testing, 'hat')).toBe(16)
  })

  test('failing adds an uneasy low drone', async () => {
    const task = startTask('investigate', 5000)
    const calmBass = count(composePhrase(task, 0, moment({ activity: 'running' })), 'bass')
    const failingBass = count(composePhrase(task, 0, moment({ activity: 'failing' })), 'bass')

    expect(failingBass).toBe(calmBass + 1)
  })

  test('each running subagent adds a harmony layer', async () => {
    const task = startTask('fan out', 5000)
    const one = count(composePhrase(task, 0, moment({ activity: 'delegating', helpers: 1 })), 'harmony')
    const two = count(composePhrase(task, 0, moment({ activity: 'delegating', helpers: 2 })), 'harmony')

    expect(one).toBeGreaterThan(0)
    expect(two).toBe(one * 2)
  })

  test('finish and fixed phrases are short rising arpeggios', async () => {
    const task = startTask('anything', 0)

    expect(composeFinish(task).length).toBe(4)
    expect(composeFixed(task).length).toBe(5)
  })

  test('energy grows with the token rate and stays between 0 and 1', async () => {
    expect(energyFromRate(0)).toBe(0)
    expect(energyFromRate(500)).toBeLessThan(energyFromRate(5000))
    expect(energyFromRate(1_000_000)).toBe(1)
  })

  test('renders a mono 16-bit WAV of the right length', async () => {
    const task = startTask('anything', 0)
    const bytes = renderWav(task.sound, composePhrase(task, 0, moment()), 1, task.seed)
    const text = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4))

    expect(text(0)).toBe('RIFF')
    expect(text(8)).toBe('WAVE')
    expect(bytes.length).toBe(44 + SAMPLE_RATE * 2)
    expect(toBase64(bytes).startsWith('UklGR')).toBe(true)
  })
})
