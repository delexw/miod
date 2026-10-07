import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const BAND = {
  plugin: 'miod',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: true,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

function standInForEngine(on: On) {
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('audio.play', () => ({ value: undefined }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box key="below" />
  })
}

test('the band shows the playing mood with a wave, and clears when miod is turned off', async ($, on) => {
  mock.clock(on, { now: 1000 })
  standInForEngine(on)

  await $.turn.start({ text: 'fix the login bug', turnId: 'turn-1' })

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const band = await $.ui.mount({ ...BAND, surface })
    expect(await band.find({ type: 'Text', text: /♪ .* bpm/ })).toBeDefined()
    expect(await band.find({ key: 'below' })).toBeDefined()
    await band.unmount()
  }

  await $.command.run({ command: 'miod', args: 'off' } as Parameters<typeof $.command.run>[0])

  const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await band.find({ type: 'Text', text: /♪/ })).toBeUndefined()
  expect(await band.find({ key: 'below' })).toBeDefined()
  await band.unmount()
})

test('/miod wave switches the look and lists the choices', async ($, on) => {
  mock.clock(on, { now: 1000 })
  standInForEngine(on)

  const list = await $.command.run({ command: 'miod', args: 'wave' } as Parameters<typeof $.command.run>[0])
  expect(list.text).toContain('bars, line, mirror, dots, pulse')

  const chosen = await $.command.run({ command: 'miod', args: 'wave dots' } as Parameters<typeof $.command.run>[0])
  expect(chosen.text).toBe('wave is dots.')

  await $.turn.start({ text: 'anything', turnId: 'turn-2' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ ...BAND, surface })
    expect(JSON.stringify(await band.drawn({ in: 'miod-wave' }))).toMatch(/[⡀⣀⣄⣤⣦⣶⣷⣿]/)
    await band.unmount()
  }
})
