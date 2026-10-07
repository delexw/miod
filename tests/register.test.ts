import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

function standInForEngine(on: On) {
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.status', () => ({ value: undefined }))
  on('tool.call', () => ({ result: {}, text: 'ok' }))
}

test('plays music while a task runs and ends it when the turn completes', async ($, on) => {
  const clock = mock.clock(on, { now: 1000 })
  standInForEngine(on)
  const plays: { mime: string | undefined }[] = []
  on('audio.play', ($, e) => {
    plays.push({ mime: e.clip.mime })
    return { value: undefined }
  })

  await $.turn.start({ text: 'fix the login bug', turnId: 'turn-1' })
  expect(plays.length).toBe(1)
  expect(plays[0]?.mime).toBe('audio/wav')

  await clock.advance(10_000)
  expect(plays.length).toBeGreaterThan(1)

  const beforeEnd = plays.length
  await $.turn.complete({
    turnId: 'turn-1',
    reason: 'answer',
    answer: 'done',
    durationMs: 10_000,
    isAborted: false,
  } as Parameters<typeof $.turn.complete>[0])
  expect(plays.length).toBe(beforeEnd + 1)

  await clock.advance(20_000)
  expect(plays.length).toBe(beforeEnd + 1)
})

test('/miod off keeps tasks silent', async ($, on) => {
  mock.clock(on, { now: 1000 })
  standInForEngine(on)
  const plays: unknown[] = []
  on('audio.play', ($, e) => {
    plays.push(e)
    return { value: undefined }
  })

  const { text } = await $.command.run({ command: 'miod', args: 'off' } as Parameters<typeof $.command.run>[0])
  expect(text).toBe('miod is off.')

  await $.turn.start({ text: 'anything', turnId: 'turn-2' })
  expect(plays.length).toBe(0)
})

test('a failing command turns tense and a passing one plays the fixed phrase', async ($, on) => {
  const clock = mock.clock(on, { now: 1000 })
  let shouldFail = true
  on('tool.call', { tool: 'Bash' }, () =>
    shouldFail ? { result: {}, text: 'failed', isError: true } : { result: {}, text: 'passed' },
  )
  standInForEngine(on)
  const plays: unknown[] = []
  on('audio.play', ($, e) => {
    plays.push(e)
    return { value: undefined }
  })

  await $.turn.start({ text: 'fix the tests', turnId: 'turn-3' })
  await $.tool.call({ tool: 'Bash', command: 'bun run test' } as Parameters<typeof $.tool.call>[0])
  const afterFailure = plays.length

  shouldFail = false
  await $.tool.call({ tool: 'Bash', command: 'bun run test' } as Parameters<typeof $.tool.call>[0])
  expect(plays.length).toBe(afterFailure + 1)

  await clock.advance(1)
})
