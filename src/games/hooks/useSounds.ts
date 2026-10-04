import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'zoomix-games-sound'

type SoundName = 'success' | 'error'

// Small synthesized tones — no audio files to ship, and they stay tiny
// on mobile data.
const TONES: Record<SoundName, number[]> = {
  success: [523.25, 659.25, 783.99, 1046.5],
  error: [311.13, 233.08],
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'off'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on')
  }, [muted])

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return

      const ctx = ctxRef.current ?? new Ctor()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') void ctx.resume()

      TONES[name].forEach((frequency, i) => {
        const start = ctx.currentTime + i * 0.11
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = name === 'success' ? 'triangle' : 'sawtooth'
        osc.frequency.setValueAtTime(frequency, start)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.2)
      })
    },
    [muted],
  )

  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  return {
    playSuccess: useCallback(() => play('success'), [play]),
    playError: useCallback(() => play('error'), [play]),
    muted,
    toggleMute,
  }
}
