import { AISettings, AIAvailableModels } from '../models/ai-settings'

/**
 * Result from generating a commit message via AI.
 */
export interface IAiCommitMessage {
  readonly title: string
  readonly description: string
}

/**
 * Makes a call to an OpenAI-compatible API to generate a commit message
 * from a git diff.
 *
 * @param diff        The git diff text of the selected files
 * @param settings    The AI settings (API keys, active model, system prompt)
 * @param signal      Optional AbortSignal to cancel the request
 * @returns           The generated commit message, or null on failure
 */
export async function generateAiCommitMessage(
  diff: string,
  settings: AISettings,
  signal?: AbortSignal
): Promise<IAiCommitMessage | null> {
  const { activeModel, systemPrompt } = settings

  if (activeModel === '') {
    return null
  }

  const modelInfo = AIAvailableModels.find(m => m.id === activeModel)
  if (modelInfo === undefined) {
    return null
  }

  const apiKey =
    modelInfo.requiresKey === 'deepseekApiKey'
      ? settings.deepseekApiKey
      : settings.mimoApiKey

  if (apiKey === '') {
    return null
  }

  // Truncate diff to a reasonable size for the model
  const truncatedDiff = diff.slice(0, 8000)

  const userMessage = ['请根据以下 git diff 生成提交消息：', '', truncatedDiff].join('\n')

  try {
    const response = await fetch(modelInfo.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        stream: false,
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      log.error(
        'AiCommitMessage: API returned ' + response.status + ': ' + errorText
      )
      return null
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string }
      }>
    }

    const choice = data.choices?.[0]
    if (!choice) {
      return null
    }

    const content = choice.message?.content?.trim()
    if (!content) {
      return null
    }

    return parseCommitMessage(content)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // Cancelled, not an error
      return null
    }

    log.error('AiCommitMessage: Failed to generate commit message', e)
    return null
  }
}

/**
 * Parse the AI response into a commit message (title + description).
 *
 * The response is expected to be plain text. The first line is the
 * title/summary, and any remaining lines form the description.
 */
function parseCommitMessage(content: string): IAiCommitMessage {
  // Normalize line endings: CRLF -> LF, standalone CR -> LF
  const normalized = content.replace(/\r\n?/g, '\n')
  const trimmed = normalized.trim()

  if (trimmed.length === 0) {
    return { title: '', description: '' }
  }

  // Find the first non-empty line as the title
  const lines = trimmed.split('\n')
  let titleEnd = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      titleEnd = i
      break
    }
  }

  if (titleEnd === -1) {
    return { title: '', description: '' }
  }

  const title = lines[titleEnd].trim()
  const rest = lines.slice(titleEnd + 1).join('\n')
  const description = rest.trim()

  return { title, description }
}
