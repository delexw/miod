import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import { activityForCommand, activityForTool, strongestActivity } from './activity'
import type { Activity } from './activity'
import { composeFinish, composeFixed, composePhrase, energyFromRate } from './compose'
import type { Moment, Note } from './compose'
import { MOODS } from './moods'
import { renderWav, toBase64 } from './synth'
import { describeTask, phraseSeconds, startTask } from './task'
import type { Task } from './task'

const isEnabled = atom({ plugin: 'miod', key: 'isEnabled' } as const, true)

const RATE_WINDOW_MS = 60_000
const GAIN = 0.6

type Spend = { at: number; tokens: number }

type Session = {
  task: Task | null
  turnId: string | null
  phraseNumber: number
  ticker: Timer | null
  playing: AbortController | null
  spends: Spend[]
  toolCalls: number
  contextFill: number
  seenThisPhrase: Activity[]
  isFailing: boolean
  helpers: number
}

const session: Session = {
  task: null,
  turnId: null,
  phraseNumber: 0,
  ticker: null,
  playing: null,
  spends: [],
  toolCalls: 0,
  contextFill: 0,
  seenThisPhrase: [],
  isFailing: false,
  helpers: 0,
}

function play($: EngineInterface, task: Task, notes: Note[], seconds: number) {
  session.playing?.abort()
  const controller = new AbortController()
  session.playing = controller
  const base64 = toBase64(renderWav(task.style, notes, seconds, task.seed))
  $.audio
    .play({ base64, mime: 'audio/wav' }, { gain: GAIN, signal: controller.signal })
    .catch(() => $.ui.status('miod: could not play audio'))
}

async function readMoment($: EngineInterface): Promise<Moment> {
  const now = await $.clock.now()
  session.spends = session.spends.filter(spend => now - spend.at < RATE_WINDOW_MS)
  const tokens = session.spends.reduce((sum, spend) => sum + spend.tokens, 0)
  const elapsed = Math.max(10_000, now - (session.spends[0]?.at ?? now))
  const seen = session.isFailing ? ['failing' as const] : session.seenThisPhrase

  const moment: Moment = {
    activity: strongestActivity(seen),
    energy: energyFromRate((tokens * 60_000) / elapsed),
    contextFill: session.contextFill,
    toolCalls: session.toolCalls,
    helpers: session.helpers,
  }
  session.toolCalls = 0
  session.seenThisPhrase = []
  return moment
}

async function playNextPhrase($: EngineInterface) {
  const task = session.task
  if (!task) {
    return
  }
  const moment = await readMoment($)
  play($, task, composePhrase(task, session.phraseNumber, moment), phraseSeconds(task))
  session.phraseNumber += 1
  $.ui.status(`♪ ${describeTask(task)}, ${MOODS[moment.activity].feel}, energy ${Math.round(moment.energy * 100)}%`)
}

async function startMusic($: EngineInterface, prompt: string, turnId: string) {
  const task = startTask(prompt, await $.clock.now())
  Object.assign(session, {
    task,
    turnId,
    phraseNumber: 0,
    spends: [],
    toolCalls: 0,
    seenThisPhrase: [],
    isFailing: false,
    helpers: 0,
  })
  await playNextPhrase($)
  session.ticker = $.clock.every(Math.round(phraseSeconds(task) * 1000), () => {
    playNextPhrase($).catch(() => undefined)
  })
}

function stopMusic($: EngineInterface, shouldPlayFinish: boolean) {
  session.ticker?.cancel()
  session.ticker = null
  if (session.task && shouldPlayFinish) {
    play($, session.task, composeFinish(session.task), phraseSeconds(session.task) / 2)
  } else {
    session.playing?.abort()
  }
  session.task = null
  session.turnId = null
  $.ui.status(undefined)
}

function noteActivity(activity: Activity) {
  if (session.task) {
    session.seenThisPhrase.push(activity)
  }
}

function noteCommandResult($: EngineInterface, hasFailed: boolean) {
  const task = session.task
  if (!task) {
    return
  }
  if (hasFailed) {
    session.isFailing = true
    return
  }
  if (session.isFailing) {
    session.isFailing = false
    play($, task, composeFixed(task), phraseSeconds(task) / 2)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'miod',
      description: 'Turn the task music on or off.',
      argumentHint: '[on|off]',
      immediate: true,
    })
    return next(e)
  })

  on('command.run', { command: 'miod' }, async ($, e) => {
    const choice = e.args.trim().toLowerCase()
    if (choice === 'on' || choice === 'off') {
      await update($, isEnabled, () => choice === 'on')
      if (choice === 'off') {
        stopMusic($, false)
      }
      return { text: `miod is ${choice}.` }
    }
    const state = (await read($, isEnabled)) ? 'on' : 'off'
    return { text: `miod is ${state}. Use /miod on or /miod off.` }
  })

  on('turn.start', async ($, e, next) => {
    const result = await next(e)
    if (!session.task && (await read($, isEnabled))) {
      await startMusic($, e.text, e.turnId)
    }
    return result
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    noteActivity(activityForCommand(e.command))
    const ran = await next(e)
    noteCommandResult($, ran.deny === undefined && ran.isError === true)
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    if (e.tool === 'Bash') {
      return next(e)
    }
    const activity = activityForTool(e.tool)
    noteActivity(activity)
    if (activity !== 'delegating') {
      return next(e)
    }
    session.helpers += 1
    try {
      return await next(e)
    } finally {
      session.helpers = Math.max(0, session.helpers - 1)
    }
  }).catch(($, e, next) => next(e))

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (session.task && result.usage) {
      const { input_tokens, output_tokens, cache_creation_input_tokens } = result.usage
      session.spends.push({
        at: await $.clock.now(),
        tokens: input_tokens + output_tokens + cache_creation_input_tokens,
      })
      session.toolCalls += result.toolUses.length
    }
    return result
  })

  on('session.measure', ($, e, next) => {
    if (e.context.percent !== undefined) {
      session.contextFill = e.context.percent / 100
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (session.task && e.turnId === session.turnId) {
      stopMusic($, e.reason === 'answer')
    }
    return result
  })

  on('session.end', ($, e, next) => {
    stopMusic($, false)
    return next(e)
  })
}
