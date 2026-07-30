import { getObject, setObject } from '../lib/local-storage'

export interface AISettings {
  readonly deepseekApiKey: string
  readonly mimoApiKey: string
  readonly activeModel: string
}

export const defaultAISettings: AISettings = {
  deepseekApiKey: '',
  mimoApiKey: '',
  activeModel: '',
}

export interface AIModelInfo {
  readonly id: string
  readonly label: string
  readonly provider: 'deepseek' | 'mimo'
  readonly requiresKey: 'deepseekApiKey' | 'mimoApiKey'
}

export const AIAvailableModels: ReadonlyArray<AIModelInfo> = [
  { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', provider: 'deepseek', requiresKey: 'deepseekApiKey' },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', provider: 'deepseek', requiresKey: 'deepseekApiKey' },
  { id: 'mimo-v2.5-pro', label: 'MiMo V2.5 Pro', provider: 'mimo', requiresKey: 'mimoApiKey' },
  { id: 'mimo-v2.5', label: 'MiMo V2.5', provider: 'mimo', requiresKey: 'mimoApiKey' },
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
