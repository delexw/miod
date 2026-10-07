export type Activity = 'thinking' | 'reading' | 'editing' | 'running' | 'testing' | 'delegating' | 'failing'

const READING_TOOLS = ['Read', 'Grep', 'Glob', 'LS', 'WebFetch', 'WebSearch', 'NotebookRead']
const EDITING_TOOLS = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']
const DELEGATING_TOOLS = ['Agent', 'Task']
const TEST_COMMAND = /\b(test|tests|spec|jest|vitest|pytest|rspec|mocha|check|lint|tsc)\b/

export function activityForTool(tool: string): Activity {
  if (READING_TOOLS.includes(tool) || tool.startsWith('mcp__')) {
    return 'reading'
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
  return TEST_COMMAND.test(command) ? 'testing' : 'running'
}

const STRONGEST_FIRST: readonly Activity[] = ['failing', 'testing', 'editing', 'running', 'delegating', 'reading', 'thinking']

export function strongestActivity(seen: readonly Activity[]): Activity {
  return STRONGEST_FIRST.find(activity => seen.includes(activity)) ?? 'thinking'
}
