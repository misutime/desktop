import * as React from 'react'
import { DialogContent } from '../dialog'
import {
  AISettings,
  AIAvailableModels,
  AIModelInfo,
  defaultAISettings,
} from '../../models/ai-settings'

interface IAIPreferencesProps {
  readonly aiSettings: AISettings
  readonly onAISettingsChanged: (settings: AISettings) => void
}

export class AI extends React.Component<IAIPreferencesProps, {}> {
  private onDeepSeekKeyChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onAISettingsChanged({
      ...this.props.aiSettings,
      deepseekApiKey: event.currentTarget.value,
    })
  }

  private onMimoKeyChanged = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onAISettingsChanged({
      ...this.props.aiSettings,
      mimoApiKey: event.currentTarget.value,
    })
  }

  private onSystemPromptChanged = (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => {
    this.props.onAISettingsChanged({
      ...this.props.aiSettings,
      systemPrompt: event.currentTarget.value,
    })
  }

  private onResetSystemPrompt = () => {
    this.props.onAISettingsChanged({
      ...this.props.aiSettings,
      systemPrompt: defaultAISettings.systemPrompt,
    })
  }

  private onModelChanged = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onAISettingsChanged({
      ...this.props.aiSettings,
      activeModel: event.currentTarget.value,
    })
  }

  /**
   * Returns a list of models with disabled state.
   * If the current activeModel references a model whose provider API key
   * is now empty, reset activeModel to ''.
   */
  private getSanitizedModelList(): ReadonlyArray<{
    model: AIModelInfo
    disabled: boolean
  }> {
    return AIAvailableModels.map(model => ({
      model,
      disabled: this.props.aiSettings[model.requiresKey] === '',
    }))
  }

  /**
   * Determines if the currently active model is still valid.
   * If not, the parent should reset it to ''.
   */
  private getActiveModel(aiSettings: AISettings): string {
    const { activeModel } = aiSettings
    if (activeModel === '') {
      return ''
    }

    const model = AIAvailableModels.find(m => m.id === activeModel)
    if (model === undefined) {
      return ''
    }

    if (aiSettings[model.requiresKey] === '') {
      return ''
    }

    return activeModel
  }

  public render() {
    const { aiSettings } = this.props
    const modelList = this.getSanitizedModelList()
    const activeModel = this.getActiveModel(aiSettings)

    return (
      <DialogContent>
        <div className="advanced-section">
          <h2>API Keys</h2>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing)',
            }}
          >
            <div className="text-box-component" style={{ flex: 1 }}>
              <label htmlFor="deepseek-api-key">DeepSeek API Key</label>
              <input
                id="deepseek-api-key"
                type="password"
                value={aiSettings.deepseekApiKey}
                onChange={this.onDeepSeekKeyChanged}
              />
            </div>
            <div className="text-box-component" style={{ flex: 1 }}>
              <label htmlFor="mimo-api-key">MiMo API Key</label>
              <input
                id="mimo-api-key"
                type="password"
                value={aiSettings.mimoApiKey}
                onChange={this.onMimoKeyChanged}
              />
            </div>
          </div>
        </div>
        <div className="advanced-section">
          <h2>Primary Model</h2>
          <div className="text-box-component">
            <label htmlFor="ai-model-select">AI Model</label>
            <select
              id="ai-model-select"
              value={activeModel}
              onChange={this.onModelChanged}
            >
              <option value="">Select a model...</option>
              {modelList.map(({ model, disabled }) => (
                <option
                  key={model.id}
                  value={model.id}
                  disabled={disabled}
                >
                  {model.label}
                  {disabled
                    ? ` (configure ${model.provider === 'deepseek' ? 'DeepSeek' : 'MiMo'} API key)`
                    : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="settings-description">
            Choose the AI model to power future AI-assisted Git features.
          </p>
        </div>
        <div className="advanced-section">
          <h2>System Prompt</h2>
          <div className="text-box-component">
            <label htmlFor="ai-system-prompt">
              Custom instructions for generating commit messages
              {aiSettings.systemPrompt !== defaultAISettings.systemPrompt && (
                <>
                  {' '}
                  <span
                    className="link-button-component"
                    role="button"
                    tabIndex={0}
                    onClick={this.onResetSystemPrompt}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        this.onResetSystemPrompt()
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Restore default
                  </span>
                </>
              )}
            </label>
            <textarea
              id="ai-system-prompt"
              rows={6}
              value={aiSettings.systemPrompt}
              onChange={this.onSystemPromptChanged}
              className="form-control"
              style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>
          <p className="settings-description">
            This prompt is sent to the AI model along with the git diff to
            generate commit messages.
          </p>
        </div>
      </DialogContent>
    )
  }
}
