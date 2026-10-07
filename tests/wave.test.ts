import { describe, expect, test } from 'claude-code/testing'

import { composePhrase } from '../hooks/compose'
import { loudness, renderClip, SAMPLE_RATE, WAVE_POINTS_PER_SECOND } from '../hooks/synth'
import { startTask } from '../hooks/task'
import { barFor, drawWave } from '../hooks/wave'

describe('wave', () => {
  test('silence is the lowest bar and full volume the highest', async () => {
    expect(barFor(0)).toBe('▁')
    expect(barFor(1)).toBe('█')
    expect(barFor(5)).toBe('█')
  })

  test('the wave fills the width and splits at how far the clip has played', async () => {
    const levels = [0, 0.5, 1, 0.5]
    const start = drawWave(levels, 8, 0)
    const half = drawWave(levels, 8, 2)

    expect(start.done).toBe('')
    expect(start.ahead.length).toBe(8)
    expect(half.done.length).toBe(4)
    expect(half.done + half.ahead).toBe(start.ahead)
  })

  test('loudness gives one level per tenth of a second, between 0 and 1', async () => {
    const levels = loudness(new Float32Array(SAMPLE_RATE).fill(0.5))

    expect(levels.length).toBe(WAVE_POINTS_PER_SECOND)
    expect(levels.every(level => level >= 0 && level <= 1)).toBe(true)
    expect(loudness(new Float32Array(SAMPLE_RATE)).every(level => level === 0)).toBe(true)
  })

  test('a rendered clip carries its wave', async () => {
    const task = startTask('anything', 0)
    const clip = renderClip(task.style, composePhrase(task, 0, { activity: 'editing', energy: 0.5, contextFill: 0, toolCalls: 0, helpers: 0 }), 2, task.seed)

    expect(clip.levels.length).toBe(2 * WAVE_POINTS_PER_SECOND)
    expect(Math.max(...clip.levels)).toBeGreaterThan(0)
  })
})
