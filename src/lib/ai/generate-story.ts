import { StoryOutline, AIError, getConfiguredProvider } from './index'
import { GenerationSettings, buildSystemPrompt, buildUserPrompt } from './prompts'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicResponse {
  content: Array<{ type: 'text'; text: string }>
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>
}

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AIError('Anthropic API key not configured', 'API_KEY_MISSING')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

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
        messages: [{ role: 'user', content: userPrompt }] as AnthropicMessage[],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.status === 429) {
      throw new AIError('Rate limited. Please wait a moment and try again.', 'RATE_LIMITED')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      throw new AIError(`API request failed: ${response.status}`, 'UNKNOWN')
    }

    const data = (await response.json()) as AnthropicResponse
    return data.content[0].text
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof AIError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError('Request timed out. Try a simpler prompt.', 'TIMEOUT')
    }
    throw new AIError('Network error. Check your internet connection.', 'NETWORK_ERROR')
  }
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new AIError('OpenAI API key not configured', 'API_KEY_MISSING')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

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
          { role: 'user', content: userPrompt },
        ] as OpenAIMessage[],
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.status === 429) {
      throw new AIError('Rate limited. Please wait a moment and try again.', 'RATE_LIMITED')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new AIError(`API request failed: ${response.status}`, 'UNKNOWN')
    }

    const data = (await response.json()) as OpenAIResponse
    return data.choices[0].message.content
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof AIError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError('Request timed out. Try a simpler prompt.', 'TIMEOUT')
    }
    throw new AIError('Network error. Check your internet connection.', 'NETWORK_ERROR')
  }
}

function parseStoryResponse(text: string): StoryOutline {
  // Try to extract JSON from the response
  let jsonText = text.trim()

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const parsed = JSON.parse(jsonText)

    // Validate the structure
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Missing or invalid title')
    }

    if (!Array.isArray(parsed.events) || parsed.events.length === 0) {
      throw new Error('Missing or empty events array')
    }

    // Validate and clean each event
    const events = parsed.events.map((event: Record<string, unknown>, index: number) => {
      if (!event.title || typeof event.title !== 'string') {
        throw new Error(`Event ${index} missing title`)
      }
      if (!event.content || typeof event.content !== 'string') {
        throw new Error(`Event ${index} missing content`)
      }

      return {
        title: String(event.title).slice(0, 100),
        content: String(event.content),
        suggestedDate: event.suggestedDate ? String(event.suggestedDate) : undefined,
      }
    })

    return {
      title: parsed.title,
      events,
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    console.error('Response text:', text.slice(0, 500))
    throw new AIError(
      'Could not parse the AI response. Please try again.',
      'INVALID_RESPONSE'
    )
  }
}

export async function generateStory(
  prompt: string,
  settings: GenerationSettings
): Promise<StoryOutline> {
  const provider = getConfiguredProvider()

  if (!provider) {
    throw new AIError(
      'No AI service configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.',
      'API_KEY_MISSING'
    )
  }

  const systemPrompt = buildSystemPrompt(settings)
  const userPrompt = buildUserPrompt(prompt)

  let responseText: string

  if (provider === 'anthropic') {
    responseText = await callAnthropic(systemPrompt, userPrompt)
  } else {
    responseText = await callOpenAI(systemPrompt, userPrompt)
  }

  return parseStoryResponse(responseText)
}
