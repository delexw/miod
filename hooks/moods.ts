import type { Activity } from './activity'
import { pick, pickWeighted } from './random'
import type { ScaleName } from './theory'

export type Drums = 'none' | 'light' | 'steady' | 'busy'

export type Mood = {
  feel: string
  color: string
  notesPerBeat: 1 | 2 | 4
  fill: number
  octave: number
  drums: Drums
  pad: boolean
  clash: boolean
}

export const MOODS: Record<Activity, readonly Mood[]> = {
  thinking: [
    { feel: 'calm', color: '#8FA3BF', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'pondering', color: '#94A7C2', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'still', color: '#8A9DB8', notesPerBeat: 1, fill: 0.05, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'hazy', color: '#9AA9C4', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'wondering', color: '#8FA8C9', notesPerBeat: 1, fill: 0.2, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'quiet', color: '#8796B0', notesPerBeat: 1, fill: 0.05, octave: -1, drums: 'none', pad: true, clash: false },
    { feel: 'mulling', color: '#93A2BB', notesPerBeat: 1, fill: 0.25, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'daydream', color: '#A0AECB', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'patient', color: '#8C9CB6', notesPerBeat: 2, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'humming', color: '#97A6C0', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'none', pad: false, clash: false },
  ],
  reading: [
    { feel: 'airy', color: '#7FB3D5', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'browsing', color: '#86B8D8', notesPerBeat: 1, fill: 0.4, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'studious', color: '#78ADD1', notesPerBeat: 1, fill: 0.45, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'flipping pages', color: '#7DB6DA', notesPerBeat: 2, fill: 0.3, octave: 1, drums: 'none', pad: false, clash: false },
    { feel: 'absorbed', color: '#73A8CC', notesPerBeat: 1, fill: 0.55, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'scanning', color: '#82B5D6', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'library', color: '#7AAFD2', notesPerBeat: 1, fill: 0.35, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'learning', color: '#88BADB', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'careful', color: '#76AACE', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'soaking in', color: '#80B2D4', notesPerBeat: 1, fill: 0.6, octave: 1, drums: 'none', pad: true, clash: false },
  ],
  exploring: [
    { feel: 'curious', color: '#A78BFA', notesPerBeat: 2, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'wandering', color: '#AE93FB', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'adventurous', color: '#A083F7', notesPerBeat: 2, fill: 0.6, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'far away', color: '#B39BFC', notesPerBeat: 1, fill: 0.4, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'searching', color: '#9C80F5', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'wide-eyed', color: '#B8A0FC', notesPerBeat: 1, fill: 0.6, octave: 2, drums: 'none', pad: true, clash: false },
    { feel: 'trekking', color: '#A589F9', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'foreign', color: '#9F86F6', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'mapping', color: '#AA8EFA', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'discovering', color: '#B496FB', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: true, clash: false },
  ],
  planning: [
    { feel: 'hopeful', color: '#F5C26B', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'organised', color: '#F2BD62', notesPerBeat: 2, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'sketching', color: '#F7C878', notesPerBeat: 1, fill: 0.35, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'optimistic', color: '#F8CA7D', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'mapping out', color: '#F0B95C', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'listing', color: '#F4C067', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'blueprint', color: '#F6C471', notesPerBeat: 1, fill: 0.45, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'focused', color: '#EFB656', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'daybreak', color: '#F9CE85', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'step by step', color: '#F3BF65', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'light', pad: false, clash: false },
  ],
  asking: [
    { feel: 'waiting', color: '#B0BEC5', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'expectant', color: '#B5C2C8', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'holding', color: '#A9B8BF', notesPerBeat: 1, fill: 0.05, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'listening', color: '#B8C5CB', notesPerBeat: 1, fill: 0.1, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'hovering', color: '#ACBAC1', notesPerBeat: 1, fill: 0.1, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'polite', color: '#B3C0C6', notesPerBeat: 1, fill: 0.15, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'paused', color: '#A6B5BC', notesPerBeat: 1, fill: 0.0, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'gentle nudge', color: '#BAC7CD', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'question mark', color: '#AFBDC4', notesPerBeat: 2, fill: 0.1, octave: 1, drums: 'none', pad: false, clash: false },
    { feel: 'on hold', color: '#A4B3BA', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
  ],
  editing: [
    { feel: 'bright', color: '#F5A623', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'crafting', color: '#F2A01A', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'sparkling', color: '#F8B03A', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'busy hands', color: '#F09A12', notesPerBeat: 4, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'sculpting', color: '#F4A92E', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'playful', color: '#F9B546', notesPerBeat: 2, fill: 0.8, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'tidy', color: '#EE9810', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'in the zone', color: '#F3A527', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'polishing', color: '#F7AD35', notesPerBeat: 1, fill: 0.6, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'building', color: '#F1A21F', notesPerBeat: 2, fill: 0.65, octave: 0, drums: 'steady', pad: true, clash: false },
  ],
  running: [
    { feel: 'driving', color: '#4FC3F7', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'rolling', color: '#56C7F8', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'machinery', color: '#48BEF5', notesPerBeat: 4, fill: 0.3, octave: -1, drums: 'steady', pad: false, clash: false },
    { feel: 'cruising', color: '#5CCAF8', notesPerBeat: 2, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'motoring', color: '#43BAF3', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'humming along', color: '#60CCF9', notesPerBeat: 1, fill: 0.5, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'on the move', color: '#4CC1F6', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'pistons', color: '#40B7F2', notesPerBeat: 2, fill: 0.45, octave: -1, drums: 'busy', pad: false, clash: false },
    { feel: 'conveyor', color: '#52C5F7', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'chugging', color: '#3DB4F0', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: false },
  ],
  installing: [
    { feel: 'patient', color: '#90A4AE', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'unpacking', color: '#96A9B3', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'downloading', color: '#8A9FA9', notesPerBeat: 4, fill: 0.2, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'assembling', color: '#9AADB6', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'loading bar', color: '#859BA5', notesPerBeat: 2, fill: 0.25, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'setting up', color: '#93A6B0', notesPerBeat: 1, fill: 0.35, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'fetching', color: '#8CA1AB', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'wiring', color: '#879CA6', notesPerBeat: 2, fill: 0.3, octave: -1, drums: 'steady', pad: false, clash: false },
    { feel: 'stacking boxes', color: '#9FB1BA', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'waiting in line', color: '#8399A3', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'light', pad: true, clash: false },
  ],
  testing: [
    { feel: 'focused', color: '#26C6DA', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'checking', color: '#2DCADD', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'precise', color: '#1FC2D7', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'ticking', color: '#33CDE0', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'nervous', color: '#1ABED4', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'lab work', color: '#38D0E2', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'steady', pad: false, clash: false },
    { feel: 'counting', color: '#22C4D9', notesPerBeat: 4, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'suspense', color: '#15BAD1', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'busy', pad: true, clash: false },
    { feel: 'verifying', color: '#2BC8DC', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'drumroll', color: '#30CBDE', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: false },
  ],
  shipping: [
    { feel: 'triumphant', color: '#FFD54F', notesPerBeat: 4, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'victory lap', color: '#FFD95C', notesPerBeat: 4, fill: 0.7, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'anthem', color: '#FFD142', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'busy', pad: true, clash: false },
    { feel: 'celebrating', color: '#FFDD69', notesPerBeat: 4, fill: 0.8, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'launch', color: '#FFCD36', notesPerBeat: 4, fill: 0.6, octave: 2, drums: 'busy', pad: false, clash: false },
    { feel: 'confetti', color: '#FFE176', notesPerBeat: 4, fill: 0.9, octave: 2, drums: 'steady', pad: false, clash: false },
    { feel: 'fanfare', color: '#FFC92A', notesPerBeat: 2, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'proud', color: '#FFD34A', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'home run', color: '#FFDB62', notesPerBeat: 4, fill: 0.7, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'shipped', color: '#FFCF3C', notesPerBeat: 4, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
  ],
  deleting: [
    { feel: 'ominous', color: '#E57373', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'careful', color: '#E37070', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'demolition', color: '#E06A6A', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'shadowy', color: '#E77777', notesPerBeat: 1, fill: 0.35, octave: -1, drums: 'none', pad: true, clash: true },
    { feel: 'vanishing', color: '#E87B7B', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'none', pad: true, clash: true },
    { feel: 'serious', color: '#DD6565', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'sweeping', color: '#EA8080', notesPerBeat: 2, fill: 0.3, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'dramatic', color: '#DB6161', notesPerBeat: 1, fill: 0.45, octave: -1, drums: 'steady', pad: true, clash: true },
    { feel: 'clean slate', color: '#EC8484', notesPerBeat: 1, fill: 0.25, octave: 0, drums: 'none', pad: true, clash: true },
    { feel: 'thunder', color: '#D95D5D', notesPerBeat: 2, fill: 0.5, octave: -2, drums: 'busy', pad: false, clash: true },
  ],
  delegating: [
    { feel: 'layered', color: '#81C784', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'choir', color: '#87CB89', notesPerBeat: 1, fill: 0.5, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'teamwork', color: '#7BC37E', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'chatter', color: '#8DCF8F', notesPerBeat: 4, fill: 0.4, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'ensemble', color: '#75BF78', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'crowd', color: '#92D294', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'round', color: '#70BB73', notesPerBeat: 2, fill: 0.45, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'hive', color: '#98D69A', notesPerBeat: 4, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'orchestra', color: '#6BB76E', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'relay', color: '#9DD99F', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
  ],
  failing: [
    { feel: 'tense', color: '#EF5350', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'worried', color: '#ED4F4C', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'alarm', color: '#F15855', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: true },
    { feel: 'stuck', color: '#EB4A47', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'light', pad: true, clash: true },
    { feel: 'frustrated', color: '#F35D5A', notesPerBeat: 2, fill: 0.55, octave: -1, drums: 'busy', pad: false, clash: true },
    { feel: 'uh-oh', color: '#E94643', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'steady', pad: false, clash: true },
    { feel: 'stormy', color: '#F5625F', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'busy', pad: true, clash: true },
    { feel: 'wobbly', color: '#E7423F', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'red light', color: '#F76764', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'troubleshooting', color: '#E53E3B', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: true },
  ],
}

export const MOOD_SCALES: Record<Activity, Partial<Record<ScaleName, number>>> = {
  thinking: { dorian: 3, 'major pentatonic': 3, lydian: 2, egyptian: 2, 'minor pentatonic': 1, 'whole tone': 1 },
  reading: { 'major pentatonic': 3, dorian: 3, major: 2, lydian: 2, 'minor pentatonic': 1, egyptian: 1 },
  exploring: { lydian: 4, 'whole tone': 2, mixolydian: 2, hirajoshi: 1, 'in sen': 1, egyptian: 1, dorian: 1 },
  planning: { 'major pentatonic': 4, major: 3, lydian: 2, mixolydian: 2, dorian: 1 },
  asking: { 'major pentatonic': 3, lydian: 2, dorian: 2, egyptian: 1, 'whole tone': 1 },
  editing: { major: 4, mixolydian: 2, 'major pentatonic': 2, lydian: 2, dorian: 1 },
  running: { mixolydian: 3, dorian: 3, 'minor pentatonic': 2, blues: 2, minor: 1 },
  installing: { 'minor pentatonic': 3, dorian: 2, 'major pentatonic': 2, egyptian: 2, mixolydian: 1, blues: 1 },
  testing: { dorian: 4, minor: 2, 'melodic minor': 2, 'harmonic minor': 1, 'minor pentatonic': 1 },
  shipping: { mixolydian: 4, major: 3, lydian: 2, 'major pentatonic': 2 },
  deleting: { phrygian: 4, 'harmonic minor': 2, 'in sen': 2, minor: 2, 'double harmonic': 1 },
  delegating: { major: 3, mixolydian: 2, dorian: 2, lydian: 2, 'major pentatonic': 1 },
  failing: { minor: 3, 'harmonic minor': 3, phrygian: 2, blues: 1, 'double harmonic': 1, 'melodic minor': 1 },
}

export const PHRASES_PER_VARIANT = 4

export type MoodChoice = { activity: Activity; mood: Mood; scale: ScaleName; phrases: number }

export function nextMood(previous: MoodChoice | null, activity: Activity, random: () => number): MoodChoice {
  if (previous && previous.activity === activity && previous.phrases < PHRASES_PER_VARIANT) {
    return { ...previous, phrases: previous.phrases + 1 }
  }
  return { activity, mood: pick(random, MOODS[activity]), scale: pickWeighted(random, MOOD_SCALES[activity]), phrases: 1 }
}
