import { ReactNode } from 'react'

interface ApplicationShellProps {
  children: ReactNode
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  return <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">{children}</div>
}
