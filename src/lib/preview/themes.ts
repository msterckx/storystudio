export interface SlideTheme {
  id: string
  name: string
  colors: {
    background: string
    title: string
    text: string
    accent: string
    captionBg: string
    captionText: string
  }
  fonts: {
    title: string
    body: string
  }
}

export const themes: SlideTheme[] = [
  {
    id: 'academic',
    name: 'Academic',
    colors: {
      background: '#ffffff',
      title: '#1e3a5f',
      text: '#333333',
      accent: '#2563eb',
      captionBg: 'rgba(30, 58, 95, 0.08)',
      captionText: '#4b5563',
    },
    fonts: {
      title: 'Georgia, serif',
      body: 'system-ui, sans-serif',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      background: '#0f172a',
      title: '#f8fafc',
      text: '#cbd5e1',
      accent: '#3b82f6',
      captionBg: 'rgba(255, 255, 255, 0.08)',
      captionText: '#94a3b8',
    },
    fonts: {
      title: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
  },
  {
    id: 'historic',
    name: 'Historic',
    colors: {
      background: '#faf5ee',
      title: '#44301e',
      text: '#5c4630',
      accent: '#92400e',
      captionBg: 'rgba(68, 48, 30, 0.06)',
      captionText: '#78633c',
    },
    fonts: {
      title: 'Georgia, serif',
      body: 'Georgia, serif',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      background: '#fafafa',
      title: '#18181b',
      text: '#52525b',
      accent: '#71717a',
      captionBg: 'rgba(0, 0, 0, 0.03)',
      captionText: '#71717a',
    },
    fonts: {
      title: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
  },
]

export function getThemeById(id: string): SlideTheme {
  return themes.find((t) => t.id === id) || themes[0]
}
