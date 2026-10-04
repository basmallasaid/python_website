import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#3776ab', '#559fd9', '#ffd43b', '#22c55e', '#f0bc0a']

/**
 * Fires a burst of confetti every time `trigger` changes.
 *
 * Renders nothing — just mount it near the top of a game and bump the number to
 * celebrate. Pass 6 (or more) for a bigger party.
 */
export function ConfettiHelper({ trigger }: { trigger: number }) {
  useEffect(() => {
    if (trigger <= 0) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const bursts = Math.min(trigger, 6)

    if (reduced) {
      // A single quiet pop instead of a full-screen storm.
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 }, colors: COLORS })
      return
    }

    for (let burst = 0; burst < bursts; burst += 1) {
      window.setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: COLORS,
          disableForReducedMotion: true,
        })
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: COLORS,
          disableForReducedMotion: true,
        })
      }, burst * 220)
    }
  }, [trigger])

  return null
}
