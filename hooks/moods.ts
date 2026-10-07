import type { Activity } from './activity'
import { pick } from './random'
import type { ScaleName } from './theory'

export type Drums = 'none' | 'light' | 'steady' | 'busy'

export type Mood = {
  feel: string
  color: string
  scale: 'home' | ScaleName
  notesPerBeat: 1 | 2 | 4
  fill: number
  octave: number
  drums: Drums
  pad: boolean
  clash: boolean
}

export const MOODS: Record<Activity, readonly Mood[]> = {
  thinking: [
    { feel: 'calm', color: '#8FA3BF', scale: 'home', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'pondering', color: '#94A7C2', scale: 'home', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'still', color: '#8A9DB8', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.05, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'hazy', color: '#9AA9C4', scale: 'dorian', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'wondering', color: '#8FA8C9', scale: 'lydian', notesPerBeat: 1, fill: 0.2, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'quiet', color: '#8796B0', scale: 'home', notesPerBeat: 1, fill: 0.05, octave: -1, drums: 'none', pad: true, clash: false },
    { feel: 'mulling', color: '#93A2BB', scale: 'minor pentatonic', notesPerBeat: 1, fill: 0.25, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'daydream', color: '#A0AECB', scale: 'whole tone', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'patient', color: '#8C9CB6', scale: 'home', notesPerBeat: 2, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'humming', color: '#97A6C0', scale: 'egyptian', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'none', pad: false, clash: false },
  ],
  reading: [
    { feel: 'airy', color: '#7FB3D5', scale: 'home', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'browsing', color: '#86B8D8', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.4, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'studious', color: '#78ADD1', scale: 'dorian', notesPerBeat: 1, fill: 0.45, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'flipping pages', color: '#7DB6DA', scale: 'home', notesPerBeat: 2, fill: 0.3, octave: 1, drums: 'none', pad: false, clash: false },
    { feel: 'absorbed', color: '#73A8CC', scale: 'minor pentatonic', notesPerBeat: 1, fill: 0.55, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'scanning', color: '#82B5D6', scale: 'home', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'library', color: '#7AAFD2', scale: 'major', notesPerBeat: 1, fill: 0.35, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'learning', color: '#88BADB', scale: 'lydian', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'careful', color: '#76AACE', scale: 'home', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'soaking in', color: '#80B2D4', scale: 'egyptian', notesPerBeat: 1, fill: 0.6, octave: 1, drums: 'none', pad: true, clash: false },
  ],
  exploring: [
    { feel: 'curious', color: '#A78BFA', scale: 'lydian', notesPerBeat: 2, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'wandering', color: '#AE93FB', scale: 'whole tone', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'adventurous', color: '#A083F7', scale: 'mixolydian', notesPerBeat: 2, fill: 0.6, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'far away', color: '#B39BFC', scale: 'hirajoshi', notesPerBeat: 1, fill: 0.4, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'searching', color: '#9C80F5', scale: 'dorian', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'wide-eyed', color: '#B8A0FC', scale: 'lydian', notesPerBeat: 1, fill: 0.6, octave: 2, drums: 'none', pad: true, clash: false },
    { feel: 'trekking', color: '#A589F9', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'foreign', color: '#9F86F6', scale: 'in sen', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'mapping', color: '#AA8EFA', scale: 'egyptian', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'discovering', color: '#B496FB', scale: 'lydian', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: true, clash: false },
  ],
  planning: [
    { feel: 'hopeful', color: '#F5C26B', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'organised', color: '#F2BD62', scale: 'major', notesPerBeat: 2, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'sketching', color: '#F7C878', scale: 'home', notesPerBeat: 1, fill: 0.35, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'optimistic', color: '#F8CA7D', scale: 'mixolydian', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'mapping out', color: '#F0B95C', scale: 'dorian', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'listing', color: '#F4C067', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'blueprint', color: '#F6C471', scale: 'home', notesPerBeat: 1, fill: 0.45, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'focused', color: '#EFB656', scale: 'major', notesPerBeat: 1, fill: 0.3, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'daybreak', color: '#F9CE85', scale: 'lydian', notesPerBeat: 1, fill: 0.5, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'step by step', color: '#F3BF65', scale: 'egyptian', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'light', pad: false, clash: false },
  ],
  asking: [
    { feel: 'waiting', color: '#B0BEC5', scale: 'lydian', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'expectant', color: '#B5C2C8', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.15, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'holding', color: '#A9B8BF', scale: 'home', notesPerBeat: 1, fill: 0.05, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'listening', color: '#B8C5CB', scale: 'dorian', notesPerBeat: 1, fill: 0.1, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'hovering', color: '#ACBAC1', scale: 'whole tone', notesPerBeat: 1, fill: 0.1, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'polite', color: '#B3C0C6', scale: 'major', notesPerBeat: 1, fill: 0.15, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'paused', color: '#A6B5BC', scale: 'home', notesPerBeat: 1, fill: 0.0, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'gentle nudge', color: '#BAC7CD', scale: 'major pentatonic', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'question mark', color: '#AFBDC4', scale: 'lydian', notesPerBeat: 2, fill: 0.1, octave: 1, drums: 'none', pad: false, clash: false },
    { feel: 'on hold', color: '#A4B3BA', scale: 'egyptian', notesPerBeat: 1, fill: 0.1, octave: 0, drums: 'none', pad: true, clash: false },
  ],
  editing: [
    { feel: 'bright', color: '#F5A623', scale: 'major', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'crafting', color: '#F2A01A', scale: 'home', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'sparkling', color: '#F8B03A', scale: 'lydian', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'busy hands', color: '#F09A12', scale: 'mixolydian', notesPerBeat: 4, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'sculpting', color: '#F4A92E', scale: 'dorian', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'playful', color: '#F9B546', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.8, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'tidy', color: '#EE9810', scale: 'major', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'in the zone', color: '#F3A527', scale: 'home', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'polishing', color: '#F7AD35', scale: 'major', notesPerBeat: 1, fill: 0.6, octave: 1, drums: 'none', pad: true, clash: false },
    { feel: 'building', color: '#F1A21F', scale: 'mixolydian', notesPerBeat: 2, fill: 0.65, octave: 0, drums: 'steady', pad: true, clash: false },
  ],
  running: [
    { feel: 'driving', color: '#4FC3F7', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'rolling', color: '#56C7F8', scale: 'mixolydian', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'machinery', color: '#48BEF5', scale: 'minor pentatonic', notesPerBeat: 4, fill: 0.3, octave: -1, drums: 'steady', pad: false, clash: false },
    { feel: 'cruising', color: '#5CCAF8', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.4, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'motoring', color: '#43BAF3', scale: 'dorian', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'humming along', color: '#60CCF9', scale: 'home', notesPerBeat: 1, fill: 0.5, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'on the move', color: '#4CC1F6', scale: 'mixolydian', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'pistons', color: '#40B7F2', scale: 'minor', notesPerBeat: 2, fill: 0.45, octave: -1, drums: 'busy', pad: false, clash: false },
    { feel: 'conveyor', color: '#52C5F7', scale: 'home', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'chugging', color: '#3DB4F0', scale: 'blues', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: false },
  ],
  installing: [
    { feel: 'patient', color: '#90A4AE', scale: 'minor pentatonic', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'unpacking', color: '#96A9B3', scale: 'home', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'downloading', color: '#8A9FA9', scale: 'dorian', notesPerBeat: 4, fill: 0.2, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'assembling', color: '#9AADB6', scale: 'mixolydian', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'loading bar', color: '#859BA5', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.25, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'setting up', color: '#93A6B0', scale: 'home', notesPerBeat: 1, fill: 0.35, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'fetching', color: '#8CA1AB', scale: 'egyptian', notesPerBeat: 2, fill: 0.3, octave: 0, drums: 'light', pad: false, clash: false },
    { feel: 'wiring', color: '#879CA6', scale: 'minor', notesPerBeat: 2, fill: 0.3, octave: -1, drums: 'steady', pad: false, clash: false },
    { feel: 'stacking boxes', color: '#9FB1BA', scale: 'blues', notesPerBeat: 2, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'waiting in line', color: '#8399A3', scale: 'home', notesPerBeat: 1, fill: 0.2, octave: 0, drums: 'light', pad: true, clash: false },
  ],
  testing: [
    { feel: 'focused', color: '#26C6DA', scale: 'dorian', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'checking', color: '#2DCADD', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'precise', color: '#1FC2D7', scale: 'minor pentatonic', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'ticking', color: '#33CDE0', scale: 'major pentatonic', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'nervous', color: '#1ABED4', scale: 'harmonic minor', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'lab work', color: '#38D0E2', scale: 'whole tone', notesPerBeat: 2, fill: 0.4, octave: 1, drums: 'steady', pad: false, clash: false },
    { feel: 'counting', color: '#22C4D9', scale: 'dorian', notesPerBeat: 4, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'suspense', color: '#15BAD1', scale: 'melodic minor', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'busy', pad: true, clash: false },
    { feel: 'verifying', color: '#2BC8DC', scale: 'home', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'busy', pad: false, clash: false },
    { feel: 'drumroll', color: '#30CBDE', scale: 'minor', notesPerBeat: 1, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: false },
  ],
  shipping: [
    { feel: 'triumphant', color: '#FFD54F', scale: 'mixolydian', notesPerBeat: 4, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'victory lap', color: '#FFD95C', scale: 'major', notesPerBeat: 4, fill: 0.7, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'anthem', color: '#FFD142', scale: 'mixolydian', notesPerBeat: 2, fill: 0.7, octave: 1, drums: 'busy', pad: true, clash: false },
    { feel: 'celebrating', color: '#FFDD69', scale: 'major pentatonic', notesPerBeat: 4, fill: 0.8, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'launch', color: '#FFCD36', scale: 'lydian', notesPerBeat: 4, fill: 0.6, octave: 2, drums: 'busy', pad: false, clash: false },
    { feel: 'confetti', color: '#FFE176', scale: 'major', notesPerBeat: 4, fill: 0.9, octave: 2, drums: 'steady', pad: false, clash: false },
    { feel: 'fanfare', color: '#FFC92A', scale: 'mixolydian', notesPerBeat: 2, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'proud', color: '#FFD34A', scale: 'major', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'home run', color: '#FFDB62', scale: 'major pentatonic', notesPerBeat: 4, fill: 0.7, octave: 1, drums: 'busy', pad: false, clash: false },
    { feel: 'shipped', color: '#FFCF3C', scale: 'home', notesPerBeat: 4, fill: 0.6, octave: 1, drums: 'busy', pad: false, clash: false },
  ],
  deleting: [
    { feel: 'ominous', color: '#E57373', scale: 'phrygian', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'careful', color: '#E37070', scale: 'minor', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'demolition', color: '#E06A6A', scale: 'phrygian', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'shadowy', color: '#E77777', scale: 'in sen', notesPerBeat: 1, fill: 0.35, octave: -1, drums: 'none', pad: true, clash: true },
    { feel: 'vanishing', color: '#E87B7B', scale: 'whole tone', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'none', pad: true, clash: true },
    { feel: 'serious', color: '#DD6565', scale: 'harmonic minor', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'sweeping', color: '#EA8080', scale: 'minor pentatonic', notesPerBeat: 2, fill: 0.3, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'dramatic', color: '#DB6161', scale: 'double harmonic', notesPerBeat: 1, fill: 0.45, octave: -1, drums: 'steady', pad: true, clash: true },
    { feel: 'clean slate', color: '#EC8484', scale: 'minor', notesPerBeat: 1, fill: 0.25, octave: 0, drums: 'none', pad: true, clash: true },
    { feel: 'thunder', color: '#D95D5D', scale: 'phrygian', notesPerBeat: 2, fill: 0.5, octave: -2, drums: 'busy', pad: false, clash: true },
  ],
  delegating: [
    { feel: 'layered', color: '#81C784', scale: 'home', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'choir', color: '#87CB89', scale: 'major', notesPerBeat: 1, fill: 0.5, octave: 0, drums: 'none', pad: true, clash: false },
    { feel: 'teamwork', color: '#7BC37E', scale: 'mixolydian', notesPerBeat: 2, fill: 0.55, octave: 0, drums: 'steady', pad: true, clash: false },
    { feel: 'chatter', color: '#8DCF8F', scale: 'major pentatonic', notesPerBeat: 4, fill: 0.4, octave: 1, drums: 'light', pad: false, clash: false },
    { feel: 'ensemble', color: '#75BF78', scale: 'dorian', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'crowd', color: '#92D294', scale: 'home', notesPerBeat: 2, fill: 0.6, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'round', color: '#70BB73', scale: 'major', notesPerBeat: 2, fill: 0.45, octave: 1, drums: 'light', pad: true, clash: false },
    { feel: 'hive', color: '#98D69A', scale: 'minor pentatonic', notesPerBeat: 4, fill: 0.35, octave: 0, drums: 'steady', pad: false, clash: false },
    { feel: 'orchestra', color: '#6BB76E', scale: 'lydian', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'light', pad: true, clash: false },
    { feel: 'relay', color: '#9DD99F', scale: 'egyptian', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: false },
  ],
  failing: [
    { feel: 'tense', color: '#EF5350', scale: 'minor', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'worried', color: '#ED4F4C', scale: 'harmonic minor', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'alarm', color: '#F15855', scale: 'phrygian', notesPerBeat: 4, fill: 0.4, octave: 0, drums: 'busy', pad: false, clash: true },
    { feel: 'stuck', color: '#EB4A47', scale: 'minor', notesPerBeat: 1, fill: 0.3, octave: -1, drums: 'light', pad: true, clash: true },
    { feel: 'frustrated', color: '#F35D5A', scale: 'blues', notesPerBeat: 2, fill: 0.55, octave: -1, drums: 'busy', pad: false, clash: true },
    { feel: 'uh-oh', color: '#E94643', scale: 'minor pentatonic', notesPerBeat: 2, fill: 0.45, octave: 0, drums: 'steady', pad: false, clash: true },
    { feel: 'stormy', color: '#F5625F', scale: 'double harmonic', notesPerBeat: 2, fill: 0.5, octave: -1, drums: 'busy', pad: true, clash: true },
    { feel: 'wobbly', color: '#E7423F', scale: 'whole tone', notesPerBeat: 2, fill: 0.4, octave: -1, drums: 'light', pad: false, clash: true },
    { feel: 'red light', color: '#F76764', scale: 'phrygian', notesPerBeat: 1, fill: 0.4, octave: -1, drums: 'steady', pad: false, clash: true },
    { feel: 'troubleshooting', color: '#E53E3B', scale: 'melodic minor', notesPerBeat: 2, fill: 0.5, octave: 0, drums: 'steady', pad: false, clash: true },
  ],
}

export const PHRASES_PER_VARIANT = 4

export type MoodChoice = { activity: Activity; mood: Mood; phrases: number }

export function nextMood(previous: MoodChoice | null, activity: Activity, random: () => number): MoodChoice {
  if (previous && previous.activity === activity && previous.phrases < PHRASES_PER_VARIANT) {
    return { ...previous, phrases: previous.phrases + 1 }
  }
  return { activity, mood: pick(random, MOODS[activity]), phrases: 1 }
}
