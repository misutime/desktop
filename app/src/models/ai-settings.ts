import { getObject, setObject } from '../lib/local-storage'

const defaultSystemPrompt = `你是 Git 提交消息生成助手。请根据用户提供的 git diff 内容，生成一条符合 Conventional Commits 规范的中文提交消息。

严格按以下格式输出，且只输出提交消息，不要解释、不要 Markdown 代码块：

\`\`\`text
type: 中文摘要

用一段通俗易懂的中文说明这次改动的主要目的和影响。

- 具体改动 1
- 具体改动 2
- 具体改动 3
\`\`\`

规则：

- 第一行必须是 \`type: 中文摘要\`，摘要要使用简单、直接的中文说明改了什么。
- \`type\` 只能从以下选一个：\`feat\`、\`fix\`、\`refactor\`、\`docs\`、\`test\`、\`build\`、\`ci\`、\`chore\`、\`perf\`、\`style\`。
- 不确定改动类型时，使用 \`chore\`。
- 第二部分和第三部分之间必须空一行。
- 描述段落用简单、自然的中文概括改动的核心目的和可能影响，避免生僻词、复杂句式和不必要的技术术语。
- 每条具体改动都以 \`- \` 开头。
- 不要编造 diff 中没有出现的功能、文件或行为。
- 如果 diff 内容很少，也要按完整格式生成消息。`

export interface AISettings {
  readonly deepseekApiKey: string
  readonly mimoApiKey: string
  readonly activeModel: string
  readonly systemPrompt: string
}

export const defaultAISettings: AISettings = {
  deepseekApiKey: '',
  mimoApiKey: '',
  activeModel: '',
  systemPrompt: defaultSystemPrompt,
}

export interface AIModelInfo {
  readonly id: string
  readonly label: string
  readonly provider: 'deepseek' | 'mimo'
  readonly requiresKey: 'deepseekApiKey' | 'mimoApiKey'
  readonly baseUrl: string
}

export const AIAvailableModels: ReadonlyArray<AIModelInfo> = [
  { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', provider: 'deepseek', requiresKey: 'deepseekApiKey', baseUrl: 'https://api.deepseek.com' },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', provider: 'deepseek', requiresKey: 'deepseekApiKey', baseUrl: 'https://api.deepseek.com' },
  { id: 'mimo-v2.5-pro', label: 'MiMo V2.5 Pro', provider: 'mimo', requiresKey: 'mimoApiKey', baseUrl: 'https://api.xiaomimimo.com/v1' },
  { id: 'mimo-v2.5', label: 'MiMo V2.5', provider: 'mimo', requiresKey: 'mimoApiKey', baseUrl: 'https://api.xiaomimimo.com/v1' },
]

const StorageKey = 'ai-settings'

export function getAISettings(): AISettings {
  const stored = getObject<AISettings>(StorageKey)
  if (stored === undefined) {
    return defaultAISettings
  }
  return { ...defaultAISettings, ...stored }
}

export function setAISettings(settings: AISettings): void {
  setObject(StorageKey, settings)
}
