"use client"

import { useCallback, useEffect, useState } from "react"
import { FloatingMotes } from "./floating-motes"

export function StartScreen() {
  const [started, setStarted] = useState(false)

  const handleStart = useCallback(() => {
    setStarted(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        setStarted(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-black select-none"
      onClick={handleStart}
      role="button"
      tabIndex={0}
      aria-label="Press to start the game"
    >
      {/* Background image with slow zoom + breathing light */}
      <div className="anim-ambient absolute inset-0" style={{ animation: "ambientlight 9s ease-in-out infinite" }}>
        <div
          className="anim-kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/classroom-hero.jpg)",
            animation: "kenburns 26s ease-in-out infinite",
          }}
        />
      </div>

      {/* Drifting diagonal light rays coming from the windows */}
      <div
        aria-hidden
        className="anim-rays absolute -inset-1/4"
        style={{
          animation: "raysdrift 14s ease-in-out infinite",
          background:
            "repeating-linear-gradient(100deg, rgba(255,230,170,0.14) 0px, rgba(255,230,170,0.14) 2px, transparent 2px, transparent 26px)",
          mixBlendMode: "screen",
          maskImage: "radial-gradient(120% 90% at 15% 10%, black 0%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 15% 10%, black 0%, transparent 65%)",
        }}
      />

      {/* Floating dust motes */}
      <FloatingMotes />

      {/* Projector flicker overlay */}
      <div
        aria-hidden
        className="anim-flicker absolute inset-0 bg-cyan-100"
        style={{ animation: "flicker 6s steps(1) infinite", mixBlendMode: "overlay" }}
      />

      {/* Cinematic vignette + bottom gradient for text legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 45%, rgba(0,0,0,0.55) 100%), linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 35%, transparent 60%)",
        }}
      />

      {/* Letterbox bars */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[6vh] bg-black" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[6vh] bg-black" />

      {/* Foreground UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-[16vh]">
        <div style={{ animation: "fadeup 1.2s ease-out both", animationDelay: "0.2s" }} className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.5em] text-cyan-200/70 sm:text-sm">A Visual Novel</p>
          <h1
            className="anim-titleglow text-balance font-serif text-5xl font-bold tracking-wide text-white sm:text-7xl md:text-8xl"
            style={{ animation: "titleglow 4s ease-in-out infinite" }}
          >
            After Class
          </h1>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="anim-press mt-10 cursor-pointer text-sm font-medium uppercase tracking-[0.4em] text-white/90 outline-none sm:text-base"
          style={{ animation: "presspulse 1.6s ease-in-out infinite", animationDelay: "1s" }}
        >
          Press Start
        </button>

        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">Click anywhere · Enter · Space</p>
      </div>

      {/* Simple "started" confirmation flash */}
      {started && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: "fadeup 0.4s ease-out both" }}
        >
          <p className="font-serif text-2xl tracking-widest text-white sm:text-4xl">Loading…</p>
        </div>
      )}
    </main>
  )
}
