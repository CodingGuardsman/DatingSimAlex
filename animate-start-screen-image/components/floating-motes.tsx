"use client"

import { useEffect, useState } from "react"

type Mote = {
  left: string
  size: number
  delay: string
  duration: string
  drift: string
  opacity: number
}

export function FloatingMotes({ count = 26 }: { count?: number }) {
  // Random values are client-only to avoid SSR hydration mismatches.
  const [motes, setMotes] = useState<Mote[]>([])

  useEffect(() => {
    setMotes(
      Array.from({ length: count }).map(() => {
        const size = 1 + Math.random() * 3.5
        return {
          left: `${Math.random() * 100}%`,
          size,
          delay: `${Math.random() * 12}s`,
          duration: `${9 + Math.random() * 12}s`,
          drift: `${(Math.random() - 0.5) * 60}px`,
          opacity: 0.25 + Math.random() * 0.5,
        }
      }),
    )
  }, [count])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m, i) => (
        <span
          key={i}
          className="anim-mote absolute bottom-[-10px] rounded-full bg-amber-100/80 blur-[0.5px]"
          style={
            {
              left: m.left,
              width: `${m.size}px`,
              height: `${m.size}px`,
              animation: `floatmote ${m.duration} linear ${m.delay} infinite`,
              boxShadow: "0 0 6px rgba(255, 240, 200, 0.6)",
              "--mote-drift": m.drift,
              "--mote-opacity": m.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
