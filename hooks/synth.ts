import type { Note, Voice } from './compose'
import { seededRandom } from './random'
import type { Sound } from './task'

export const SAMPLE_RATE = 22050

type VoiceSound = { attackSeconds: number; fadePerSecond: number }

const VOICE_SOUND: Record<Voice, VoiceSound> = {
  lead: { attackSeconds: 0.008, fadePerSecond: 3 },
  harmony: { attackSeconds: 0.02, fadePerSecond: 3 },
  bass: { attackSeconds: 0.01, fadePerSecond: 1.5 },
  pad: { attackSeconds: 0.4, fadePerSecond: 0 },
  hat: { attackSeconds: 0.001, fadePerSecond: 60 },
}

export function renderWav(sound: Sound, notes: readonly Note[], seconds: number, noiseSeed: number): Uint8Array {
  const samples = mix(sound, notes, Math.ceil(seconds * SAMPLE_RATE), seededRandom(noiseSeed))
  return encodeWav(samples)
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function mix(sound: Sound, notes: readonly Note[], length: number, noise: () => number): Float32Array {
  const samples = new Float32Array(length)

  for (const note of notes) {
    const { attackSeconds, fadePerSecond } = VOICE_SOUND[note.voice]
    const waveShape: Sound = note.voice === 'lead' || note.voice === 'harmony' ? sound : 'sine'
    const first = Math.floor(note.start * SAMPLE_RATE)
    const count = Math.min(length - first, Math.floor(note.length * SAMPLE_RATE))

    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE
      const fadeIn = Math.min(1, t / attackSeconds)
      const fadeOut = Math.min(1, (count - i) / (SAMPLE_RATE * 0.02))
      const volume = fadeIn * fadeOut * Math.exp(-fadePerSecond * t) * note.gain
      const value = note.voice === 'hat' ? noise() * 2 - 1 : wave(waveShape, note.frequency * t)
      samples[first + i] = (samples[first + i] ?? 0) + value * volume
    }
  }

  return samples
}

function wave(sound: Sound, cycles: number): number {
  const sine = Math.sin(2 * Math.PI * cycles)
  if (sound === 'sine') {
    return sine
  }
  if (sound === 'triangle') {
    return 4 * Math.abs(cycles - Math.floor(cycles + 0.5)) - 1
  }
  return Math.tanh(3 * sine) * 0.7
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
