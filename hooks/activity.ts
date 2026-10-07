export type Activity =
  | 'thinking'
  | 'reading'
  | 'exploring'
  | 'planning'
  | 'asking'
  | 'editing'
  | 'running'
  | 'installing'
  | 'testing'
  | 'shipping'
  | 'deleting'
  | 'delegating'
  | 'failing'

const READING_TOOLS = ['Read', 'Grep', 'Glob', 'LS', 'NotebookRead']
const EXPLORING_TOOLS = ['WebFetch', 'WebSearch']
const PLANNING_TOOLS = ['TodoWrite', 'TaskCreate', 'TaskUpdate', 'EnterPlanMode', 'ExitPlanMode']
const ASKING_TOOLS = ['AskUserQuestion']
const EDITING_TOOLS = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']
const DELEGATING_TOOLS = ['Agent', 'Task']

const SHIPPING_COMMAND = /\bgit (commit|push|merge|tag)\b|\bgh pr (create|merge)\b/
const DELETING_COMMAND = /\brm -[a-z]*r|\bgit (reset --hard|clean)\b|\bdrop (table|database)\b/i
const INSTALLING_COMMAND = /\b(npm|yarn|pnpm|bun) (install|add|i)\b|\b(pip|brew|gem) install\b|\bbundle install\b/
const TEST_COMMAND = /\b(test|tests|spec|jest|vitest|pytest|rspec|mocha|check|lint|tsc)\b/

export function activityForTool(tool: string): Activity {
  if (READING_TOOLS.includes(tool) || tool.startsWith('mcp__')) {
    return 'reading'
  }
  if (EXPLORING_TOOLS.includes(tool)) {
    return 'exploring'
  }
  if (PLANNING_TOOLS.includes(tool)) {
    return 'planning'
  }
  if (ASKING_TOOLS.includes(tool)) {
    return 'asking'
  }
  if (EDITING_TOOLS.includes(tool)) {
    return 'editing'
  }
  if (DELEGATING_TOOLS.includes(tool)) {
    return 'delegating'
  }
  return 'running'
}

export function activityForCommand(command: string): Activity {
  if (SHIPPING_COMMAND.test(command)) {
    return 'shipping'
  }
  if (DELETING_COMMAND.test(command)) {
    return 'deleting'
  }
  if (INSTALLING_COMMAND.test(command)) {
    return 'installing'
  }
  if (TEST_COMMAND.test(command)) {
    return 'testing'
  }
  return 'running'
}

export const STRONGEST_FIRST: readonly Activity[] = [
  'failing',
  'shipping',
  'deleting',
  'testing',
  'editing',
  'installing',
  'running',
  'delegating',
  'planning',
  'exploring',
  'asking',
  'reading',
  'thinking',
]

export function strongestActivity(seen: readonly Activity[]): Activity {
  return STRONGEST_FIRST.find(activity => seen.includes(activity)) ?? 'thinking'
}
