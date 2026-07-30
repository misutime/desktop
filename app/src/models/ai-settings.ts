import { getObject, setObject } from '../lib/local-storage'

const defaultSystemPrompt = `你是一个专业的 Git 提交消息生成器。根据提供的 git diff 内容，生成一条符合 Conventional Commits 规范的提交消息。

输出格式要求：
- 第一行为摘要行，采用 \`type: 中文摘要\` 格式
- 空一行后写描述段落（概述变更的核心目的和影响）
- 再空一行，用 \`- item\` 列出具体改动点
- type 仅使用以下之一：feat, fix, refactor, docs, test, build, ci, chore, perf, style
- 无法准确分类时使用 chore
- 只返回提交消息本身，不要任何额外解释或格式

示例：
\`\`\`
feat: 新增用户登录页面

实现了微信扫码登录功能，支持多平台认证和自动刷新 token。

- 增加微信 OAuth2 授权流程
- 增加扫码登录页面 UI
- 增加 token 自动刷新机制
- 增加登录状态持久化
\`\`\``

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
