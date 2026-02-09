'use server'

import { AIError, getConfiguredProvider } from './index'

interface AnthropicResponse {
  content: Array<{ type: 'text'; text: string }>
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>
}

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string }

async function callAnthropicVision(
  systemPrompt: string,
  content: ContentBlock[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AIError('Anthropic API key not configured', 'API_KEY_MISSING')
  }

  const anthropicContent = content.map((block) => {
    if (block.type === 'text') {
      return { type: 'text' as const, text: block.text }
    }
    return {
      type: 'image' as const,
      source: { type: 'url' as const, url: block.url },
    }
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: anthropicContent }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.status === 429) {
      throw new AIError('Rate limited. Please wait a moment and try again.', 'RATE_LIMITED')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic Vision API error:', errorText)
      throw new AIError(`API request failed: ${response.status}`, 'UNKNOWN')
    }

    const data = (await response.json()) as AnthropicResponse
    return data.content[0].text
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof AIError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError('Request timed out. Try again.', 'TIMEOUT')
    }
    throw new AIError('Network error. Check your internet connection.', 'NETWORK_ERROR')
  }
}

async function callOpenAIVision(
  systemPrompt: string,
  content: ContentBlock[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new AIError('OpenAI API key not configured', 'API_KEY_MISSING')
  }

  const openaiContent = content.map((block) => {
    if (block.type === 'text') {
      return { type: 'text' as const, text: block.text }
    }
    return {
      type: 'image_url' as const,
      image_url: { url: block.url, detail: 'low' as const },
    }
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: openaiContent },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.status === 429) {
      throw new AIError('Rate limited. Please wait a moment and try again.', 'RATE_LIMITED')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Vision API error:', errorText)
      throw new AIError(`API request failed: ${response.status}`, 'UNKNOWN')
    }

    const data = (await response.json()) as OpenAIResponse
    return data.choices[0].message.content
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof AIError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError('Request timed out. Try again.', 'TIMEOUT')
    }
    throw new AIError('Network error. Check your internet connection.', 'NETWORK_ERROR')
  }
}

export async function callAIVision(
  systemPrompt: string,
  content: ContentBlock[]
): Promise<string> {
  const provider = getConfiguredProvider()

  if (!provider) {
    throw new AIError(
      'No AI service configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.',
      'API_KEY_MISSING'
    )
  }

  if (provider === 'anthropic') {
    return callAnthropicVision(systemPrompt, content)
  } else {
    return callOpenAIVision(systemPrompt, content)
  }
}
