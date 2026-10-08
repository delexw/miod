import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import { activityForCommand, activityForTool, strongestActivity } from './activity'
import type { Activity } from './activity'
import { drawBand } from './band'
import { composeFinish, composeFixed, composePhrase, energyFromRate, soundingScale } from './compose'
import type { Moment, Note } from './compose'
import { nextMood } from './moods'
import type { MoodChoice } from './moods'
import { seededRandom } from './random'
import { renderClip, toBase64, WAVE_POINTS_PER_SECOND } from './synth'
import type { Fade } from './synth'
import { describeTask, phraseSeconds, startTask } from './task'
import { DEFAULT_WAVE, isWaveName, WAVE_NAMES } from './waves'
import type { Task } from './task'
import type { ScaleName } from './theory'
import type { NowPlaying } from '../types'

const isEnabled = atom({ plugin: 'miod', key: 'isEnabled' } as const, true)
const nowPlaying = atom({ plugin: 'miod', key: 'nowPlaying' } as const, null)
const chosenWave = atom({ plugin: 'miod', key: 'wave' } as const, DEFAULT_WAVE)

const RATE_WINDOW_MS = 60_000
const GAIN = 0.1
const FINISH_LOOK: Look = { label: 'finished', color: '#F5A623' }
const FIXED_LOOK: Look = { label: 'fixed', color: '#81C784' }

type Spend = { at: number; tokens: number }

type Look = { label: string; color: string }

type PlayOptions = { fade?: Fade }

type Session = {
  task: Task | null
  turnId: string | null
  phraseNumber: number
  ticker: Timer | null
  playing: Set<AbortController>
  spends: Spend[]
  toolCalls: number
  contextFill: number
  seenThisPhrase: Activity[]
  isFailing: boolean
  helpers: number
  clipCount: number
  lastTask: Task | null
  moodChoice: MoodChoice | null
  phraseEndsAt: number
  finishTimer: Timer | null
}

const session: Session = {
  task: null,
  turnId: null,
  phraseNumber: 0,
  ticker: null,
  playing: new Set(),
  spends: [],
  toolCalls: 0,
  contextFill: 0,
  seenThisPhrase: [],
  isFailing: false,
  helpers: 0,
  clipCount: 0,
  lastTask: null,
  moodChoice: null,
  phraseEndsAt: 0,
  finishTimer: null,
}

function play($: EngineInterface, task: Task, notes: Note[], seconds: number, look: Look, options: PlayOptions = {}) {
  const controller = new AbortController()
  session.playing.add(controller)
  const clip = renderClip(task.style, notes, seconds, task.seed, options.fade)
  session.clipCount += 1
  showWave($, { clipId: session.clipCount, ...look, levels: clip.levels, pointsPerSecond: WAVE_POINTS_PER_SECOND })
  $.audio
    .play({ base64: toBase64(clip.wav), mime: 'audio/wav' }, { gain: GAIN, signal: controller.signal })
    .catch(() => $.ui.toast('miod: could not play audio'))
    .finally(() => session.playing.delete(controller))
}

function silence() {
  session.playing.forEach(controller => controller.abort())
  session.playing.clear()
}

function showWave($: EngineInterface, clip: NowPlaying | null) {
  update($, nowPlaying, () => clip).catch(() => undefined)
}

async function readMoment($: EngineInterface, now: number): Promise<Moment> {
  session.spends = session.spends.filter(spend => now - spend.at < RATE_WINDOW_MS)
  const tokens = session.spends.reduce((sum, spend) => sum + spend.tokens, 0)
  const elapsed = Math.max(10_000, now - (session.spends[0]?.at ?? now))
  const seen = session.isFailing ? ['failing' as const] : session.seenThisPhrase

  const task = session.task
  const random = seededRandom((task?.seed ?? 0) + session.phraseNumber * 7919)
  session.moodChoice = nextMood(session.moodChoice, strongestActivity(seen), random)
  const moment: Moment = {
    mood: session.moodChoice.mood,
    scale: session.moodChoice.scale,
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
  const now = await $.clock.now()
  const moment = await readMoment($, now)
  const mood = moment.mood
  const seconds = phraseSeconds(task)
  const isFirst = session.phraseNumber === 0
  const look = { label: `${mood.feel} · ${describeTask(task, soundingScale(task, moment.scale))} · energy ${Math.round(moment.energy * 100)}%`, color: mood.color }
  play($, task, composePhrase(task, session.phraseNumber, moment), seconds, look, {
    fade: isFirst ? { inSeconds: seconds / 2 } : undefined,
  })
  session.phraseNumber += 1
  session.phraseEndsAt = now + seconds * 1000
}

async function startMusic($: EngineInterface, prompt: string, turnId: string) {
  session.finishTimer?.cancel()
  session.finishTimer = null
  const task = startTask(prompt, await $.clock.now(), session.lastTask ?? undefined)
  Object.assign(session, {
    task,
    turnId,
    phraseNumber: 0,
    spends: [],
    toolCalls: 0,
    seenThisPhrase: [],
    isFailing: false,
    helpers: 0,
    moodChoice: null,
  })
  await playNextPhrase($)
  session.ticker = $.clock.every(Math.round(phraseSeconds(task) * 1000), () => {
    playNextPhrase($).catch(() => undefined)
  })
}

async function stopMusic($: EngineInterface, shouldPlayFinish: boolean) {
  session.ticker?.cancel()
  session.ticker = null
  session.finishTimer?.cancel()
  session.finishTimer = null
  const task = session.task
  const scale = session.moodChoice?.scale
  if (task && scale && shouldPlayFinish) {
    session.lastTask = task
    const wait = Math.max(0, session.phraseEndsAt - (await $.clock.now()))
    session.finishTimer = $.clock.after(Math.round(wait), () => playFinish($, task, scale))
  } else {
    silence()
    showWave($, null)
  }
  session.task = null
  session.turnId = null
}

function playFinish($: EngineInterface, task: Task, scale: ScaleName) {
  session.finishTimer = null
  if (session.task) {
    return
  }
  const seconds = phraseSeconds(task)
  play($, task, composeFinish(task, soundingScale(task, scale)), seconds, FINISH_LOOK, { fade: { outSeconds: seconds / 2 } })
  session.finishTimer = $.clock.after(Math.round(seconds * 1000), () => {
    session.finishTimer = null
    if (!session.task) {
      showWave($, null)
    }
  })
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
    play($, task, composeFixed(task), phraseSeconds(task) / 2, FIXED_LOOK)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'miod',
      description: 'Turn the task music on or off.',
      argumentHint: '[on|off|wave <name>]',
      immediate: true,
    })
    return next(e)
  })

  on('command.run', { command: 'miod' }, async ($, e) => {
    const [choice = '', name = ''] = e.args.trim().toLowerCase().split(/\s+/)
    if (choice === 'wave') {
      if (!isWaveName(name)) {
        return { text: `waves: ${WAVE_NAMES.join(', ')}. Now: ${await read($, chosenWave)}. Use /miod wave <name>.` }
      }
      await update($, chosenWave, () => name)
      return { text: `wave is ${name}.` }
    }
    if (choice === 'on' || choice === 'off') {
      await update($, isEnabled, () => choice === 'on')
      if (choice === 'off') {
        await stopMusic($, false)
      }
      return { text: `${choice}.` }
    }
    const state = (await read($, isEnabled)) ? 'on' : 'off'
    return { text: `${state}. Use /miod on, /miod off, or /miod wave <name>.` }
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
      await stopMusic($, e.reason === 'answer')
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    const clip = await read($, nowPlaying)
    if (!clip || e.props.hasSurvey) {
      return below
    }
    return drawBand($.ui.resolve(e), clip, await read($, chosenWave), e.props.bodyColumns, below)
  })

  on('session.end', async ($, e, next) => {
    await stopMusic($, false)
    return next(e)
  })
}
