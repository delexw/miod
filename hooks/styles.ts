export type Wave = (cycles: number) => number

const sine: Wave = cycles => Math.sin(2 * Math.PI * cycles)

export const STYLES = {
  sine,
  triangle: cycles => 4 * Math.abs(cycles - Math.floor(cycles + 0.5)) - 1,
  'soft-square': cycles => Math.tanh(3 * sine(cycles)) * 0.7,
  'soft-saw': cycles => Math.tanh(2 * (2 * (cycles - Math.floor(cycles + 0.5)))) * 0.8,
  organ: cycles => (sine(cycles) + 0.5 * sine(2 * cycles) + 0.25 * sine(3 * cycles)) / 1.75,
} satisfies Record<string, Wave>

export type Style = keyof typeof STYLES

export const STYLE_NAMES = Object.keys(STYLES) as Style[]
