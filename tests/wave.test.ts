import { describe, expect, test } from 'claude-code/testing'

import { composePhrase } from '../hooks/compose'
import { MOODS } from '../hooks/moods'
import { loudness, renderClip, SAMPLE_RATE, WAVE_POINTS_PER_SECOND } from '../hooks/synth'
import { startTask } from '../hooks/task'
import { DEFAULT_WAVE, isWaveName, WAVE_NAMES, WAVES, waveLook } from '../hooks/waves'
import { barCell } from '../hooks/waves/bars'

describe('wave', () => {
  test('a bar is two rows tall: quiet fills the bottom row a little, loud fills both', async () => {
    expect(barCell(0, 0)).toBe(' ')
    expect(barCell(0, 1)).toBe('▁')
    expect(barCell(0.5, 0)).toBe(' ')
    expect(barCell(0.5, 1)).toBe('█')
    expect(barCell(1, 0)).toBe('█')
  })

  test('bars have a gap between them and split at how far the clip has played', async () => {
    const levels = [0, 0.5, 1, 0.5]
    const start = WAVES.bars.draw(levels, 8, 0)
    const half = WAVES.bars.draw(levels, 8, 2)

    expect(start[1]?.ahead).toBe('▁ █ █ █ ')
    expect(start[0]?.ahead).toBe('    █   ')
    expect(half[1]?.done).toBe('▁ █ ')
  })

  test('every wave look draws its rows, fits the width and splits where the clip has played', async () => {
    const levels = Array.from({ length: 40 }, (_, i) => (i % 10) / 9)
    for (const name of WAVE_NAMES) {
      const look = WAVES[name]
      const start = look.draw(levels, 30, 0)
      const half = look.draw(levels, 30, 20)

      expect(start.length).toBe(look.rows)
      start.forEach((row, i) => {
        expect(row.done).toBe('')
        expect([...row.ahead].length).toBeLessThanOrEqual(30)
        expect((half[i]?.done ?? '') + (half[i]?.ahead ?? '')).toBe(row.ahead)
      })
      expect(half[0]?.done.length).toBeGreaterThan(0)
    }
  })

  test('an unknown wave name falls back to the default look', async () => {
    expect(waveLook('nope')).toBe(WAVES[DEFAULT_WAVE])
    expect(isWaveName('dots')).toBe(true)
  })

  test('loudness gives one level per tenth of a second, between 0 and 1', async () => {
    const levels = loudness(new Float32Array(SAMPLE_RATE).fill(0.5))

    expect(levels.length).toBe(WAVE_POINTS_PER_SECOND)
    expect(levels.every(level => level >= 0 && level <= 1)).toBe(true)
    expect(loudness(new Float32Array(SAMPLE_RATE)).every(level => level === 0)).toBe(true)
  })

  test('a rendered clip carries its wave', async () => {
    const task = startTask('anything', 0)
    const mood = MOODS.editing[0]
    if (!mood) {
      throw new Error('editing has no variants')
    }
    const clip = renderClip(task.style, composePhrase(task, 0, { mood, energy: 0.5, contextFill: 0, toolCalls: 0, helpers: 0 }), 2, task.seed)

    expect(clip.levels.length).toBe(2 * WAVE_POINTS_PER_SECOND)
    expect(Math.max(...clip.levels)).toBeGreaterThan(0)
  })
})
