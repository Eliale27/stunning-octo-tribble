/** The study room floor plan, in tiles. Furniture blocks movement; zones are only labels and colour. */

export const COLS = 24
export const ROWS = 15
export const TILE = 32

export interface Zone { x: number; y: number; w: number; h: number; label: string; tone: string }
export interface Item { x: number; y: number; w: number; h: number; emoji?: string; tone: string; round?: boolean }

// labels are translation keys under `room.zones.*`
export const zones: Zone[] = [
  { x: 1, y: 1, w: 10, h: 7, label: 'quiet', tone: 'bg-sage-soft' },
  { x: 13, y: 1, w: 10, h: 7, label: 'group', tone: 'bg-sky-soft' },
  { x: 1, y: 9, w: 9, h: 5, label: 'cafe', tone: 'bg-peach-soft' },
  { x: 13, y: 9, w: 10, h: 5, label: 'lounge', tone: 'bg-lilac-soft' },
]

export const items: Item[] = [
  // quiet desks
  { x: 2, y: 3, w: 3, h: 1, emoji: '💻', tone: 'bg-beige-2' },
  { x: 7, y: 3, w: 3, h: 1, emoji: '📚', tone: 'bg-beige-2' },
  { x: 2, y: 6, w: 3, h: 1, emoji: '📝', tone: 'bg-beige-2' },
  { x: 7, y: 6, w: 3, h: 1, emoji: '🖊️', tone: 'bg-beige-2' },
  // bookshelves between the top zones
  { x: 11, y: 1, w: 1, h: 3, emoji: '📚', tone: 'bg-butter' },
  { x: 11, y: 5, w: 1, h: 3, emoji: '📖', tone: 'bg-butter' },
  // group table
  { x: 16, y: 3, w: 4, h: 2, emoji: '🧠', tone: 'bg-beige-2', round: true },
  { x: 22, y: 1, w: 1, h: 1, emoji: '🪴', tone: 'bg-transparent' },
  // café
  { x: 1, y: 9, w: 4, h: 1, emoji: '☕', tone: 'bg-peach' },
  { x: 7, y: 11, w: 2, h: 2, emoji: '🍪', tone: 'bg-beige-2', round: true },
  { x: 1, y: 13, w: 1, h: 1, emoji: '🪴', tone: 'bg-transparent' },
  // lounge
  { x: 15, y: 12, w: 5, h: 1, emoji: '🛋️', tone: 'bg-lilac' },
  { x: 22, y: 9, w: 1, h: 1, emoji: '🪴', tone: 'bg-transparent' },
  { x: 22, y: 13, w: 1, h: 1, emoji: '🎧', tone: 'bg-transparent' },
]

const blocked = (() => {
  const g: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  for (const it of items) for (let y = it.y; y < it.y + it.h; y++) for (let x = it.x; x < it.x + it.w; x++) g[y][x] = true
  return g
})()

export const walkable = (x: number, y: number) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !blocked[y][x]

/** Random free tile in the hallway, where everyone arrives. */
export function spawnPoint(): { x: number; y: number } {
  for (let i = 0; i < 50; i++) {
    const x = 9 + Math.floor(Math.random() * 6), y = 8 + Math.floor(Math.random() * 2)
    if (walkable(x, y)) return { x, y }
  }
  return { x: 12, y: 8 }
}

/** Shortest walkable path (BFS), excluding the start tile. Empty when unreachable. */
export function findPath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
  if (!walkable(to.x, to.y)) return []
  const key = (x: number, y: number) => y * COLS + x
  const prev = new Map<number, number>([[key(from.x, from.y), -1]])
  const queue = [key(from.x, from.y)]
  const goal = key(to.x, to.y)
  while (queue.length) {
    const k = queue.shift()!
    if (k === goal) break
    const x = k % COLS, y = Math.floor(k / COLS)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny)
      if (walkable(nx, ny) && !prev.has(nk)) { prev.set(nk, k); queue.push(nk) }
    }
  }
  if (!prev.has(goal)) return []
  const path: { x: number; y: number }[] = []
  for (let k = goal; k !== key(from.x, from.y); k = prev.get(k)!) path.unshift({ x: k % COLS, y: Math.floor(k / COLS) })
  return path
}
