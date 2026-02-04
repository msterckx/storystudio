import { NextRequest, NextResponse } from 'next/server'
import { generateStory } from '@/lib/ai/generate-story'
import { AIError } from '@/lib/ai'
import { GenerationSettings } from '@/lib/ai/prompts'
import { createProject } from '@/lib/db/projects'
import { createEvent } from '@/lib/db/events'

interface GenerateStoryRequest {
  prompt: string
  settings: GenerationSettings
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateStoryRequest
    const { prompt, settings } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Generate the story outline
    const outline = await generateStory(prompt.trim(), settings)

    // Create the project
    const project = await createProject(outline.title)

    // Update project settings with generation info
    // (We'll store the generation settings in the project's settings JSON)
    const projectSettings = {
      generationPrompt: prompt,
      audienceLevel: settings.audienceLevel,
      tone: settings.tone,
      targetLength: settings.targetLength,
      generatedAt: new Date().toISOString(),
    }

    // Create events from the outline
    for (const eventData of outline.events) {
      const metadata = eventData.suggestedDate
        ? JSON.stringify({ date: eventData.suggestedDate })
        : '{}'

      await createEvent(project.id, {
        title: eventData.title,
        content: eventData.content,
        metadata,
        source: 'ai',
      })
    }

    return NextResponse.json({
      project: {
        ...project,
        settings: JSON.stringify(projectSettings),
      },
      eventCount: outline.events.length,
    })
  } catch (error) {
    console.error('Story generation failed:', error)

    if (error instanceof AIError) {
      const statusCode =
        error.code === 'API_KEY_MISSING' ? 503 :
        error.code === 'RATE_LIMITED' ? 429 :
        error.code === 'TIMEOUT' ? 504 :
        500

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}
