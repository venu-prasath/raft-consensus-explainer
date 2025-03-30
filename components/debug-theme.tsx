"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function DebugTheme() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 bg-card p-4 rounded-lg border border-border z-50 text-xs">
      <div>Current theme: {theme}</div>
      <div>Resolved theme: {resolvedTheme}</div>
      <div className="flex gap-2 mt-2">
        <button className="px-2 py-1 bg-primary text-primary-foreground rounded" onClick={() => setTheme("light")}>
          Set Light
        </button>
        <button className="px-2 py-1 bg-primary text-primary-foreground rounded" onClick={() => setTheme("dark")}>
          Set Dark
        </button>
      </div>
    </div>
  )
}

