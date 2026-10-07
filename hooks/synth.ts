import type { Note, Voice } from './compose'
import { seededRandom } from './random'
import { STYLES } from './styles'
import type { Style } from './styles'

export const SAMPLE_RATE = 22050
export const WAVE_POINTS_PER_SECOND = 10

type VoiceSound = { attackSeconds: number; fadePerSecond: number }

const VOICE_SOUND: Record<Voice, VoiceSound> = {
  lead: { attackSeconds: 0.008, fadePerSecond: 3 },
  harmony: { attackSeconds: 0.02, fadePerSecond: 3 },
  bass: { attackSeconds: 0.01, fadePerSecond: 1.5 },
  pad: { attackSeconds: 0.4, fadePerSecond: 0 },
  hat: { attackSeconds: 0.001, fadePerSecond: 60 },
}

export type Clip = { wav: Uint8Array; levels: number[] }

export type Fade = { inSeconds?: number; outSeconds?: number }

export function renderClip(style: Style, notes: readonly Note[], seconds: number, noiseSeed: number, fade: Fade = {}): Clip {
  const samples = mix(style, notes, Math.ceil(seconds * SAMPLE_RATE), seededRandom(noiseSeed))
  applyFade(samples, fade)
  return { wav: encodeWav(samples), levels: loudness(samples) }
}

function applyFade(samples: Float32Array, { inSeconds = 0, outSeconds = 0 }: Fade) {
  const fadeIn = Math.floor(inSeconds * SAMPLE_RATE)
  const fadeOut = Math.floor(outSeconds * SAMPLE_RATE)
  for (let i = 0; i < samples.length; i++) {
    const rise = fadeIn > 0 ? Math.min(1, i / fadeIn) : 1
    const fall = fadeOut > 0 ? Math.min(1, (samples.length - i) / fadeOut) : 1
    samples[i] = (samples[i] ?? 0) * rise * fall
  }
}

export function loudness(samples: Float32Array): number[] {
  const size = Math.floor(SAMPLE_RATE / WAVE_POINTS_PER_SECOND)
  const levels: number[] = []
  for (let start = 0; start < samples.length; start += size) {
    let sum = 0
    const end = Math.min(samples.length, start + size)
    for (let i = start; i < end; i++) {
      sum += (samples[i] ?? 0) ** 2
    }
    levels.push(Math.min(1, Math.sqrt(sum / (end - start)) * 4))
  }
  return levels
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function mix(style: Style, notes: readonly Note[], length: number, noise: () => number): Float32Array {
  const samples = new Float32Array(length)

  for (const note of notes) {
    const { attackSeconds, fadePerSecond } = VOICE_SOUND[note.voice]
    const wave = STYLES[note.voice === 'lead' || note.voice === 'harmony' ? style : 'sine']
    const first = Math.floor(note.start * SAMPLE_RATE)
    const count = Math.min(length - first, Math.floor(note.length * SAMPLE_RATE))

    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE
      const fadeIn = Math.min(1, t / attackSeconds)
      const fadeOut = Math.min(1, (count - i) / (SAMPLE_RATE * 0.02))
      const volume = fadeIn * fadeOut * Math.exp(-fadePerSecond * t) * note.gain
      const value = note.voice === 'hat' ? noise() * 2 - 1 : wave(note.frequency * t)
      samples[first + i] = (samples[first + i] ?? 0) + value * volume
    }
  }

  return samples
}


function encodeWav(samples: Float32Array): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2)
  const view = new DataView(bytes.buffer)
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i))
    }
  }

  writeText(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((sample, i) => view.setInt16(44 + i * 2, Math.round(Math.tanh(sample) * 32767), true))

  return bytes
}
