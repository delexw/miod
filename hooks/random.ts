export function hashText(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function at<T>(items: readonly T[], index: number): T {
  const item = items[((index % items.length) + items.length) % items.length]
  if (item === undefined) {
    throw new Error('miod: picked from an empty list')
  }
  return item
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  return at(items, Math.floor(random() * items.length))
}

export function pickWeighted<K extends string>(random: () => number, weights: Partial<Record<K, number>>): K {
  const entries = Object.entries(weights) as [K, number][]
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [key, weight] of entries) {
    roll -= weight
    if (roll < 0) {
      return key
    }
  }
  return at(entries, -1)[0]
}
