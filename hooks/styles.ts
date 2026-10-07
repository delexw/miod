export type Wave = (cycles: number) => number

const sine: Wave = cycles => Math.sin(2 * Math.PI * cycles)

export const STYLES = {
  sine,
  triangle: cycles => 4 * Math.abs(cycles - Math.floor(cycles + 0.5)) - 1,
  'soft-square': cycles => Math.tanh(3 * sine(cycles)) * 0.7,
} satisfies Record<string, Wave>

export type Style = keyof typeof STYLES

export const STYLE_NAMES = Object.keys(STYLES) as Style[]
