import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe audio context creation
let audioCtx: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === "undefined") return null
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        audioCtx = new AudioContext()
      }
    }
    // Resume if suspended (common browser policy)
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume()
    }
    return audioCtx
  } catch (e) {
    console.error("AudioContext error:", e)
    return null
  }
}

export const playBeep = (frequency = 800, duration = 50, type: OscillatorType = "square") => {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = frequency

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration / 1000)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration / 1000)
  } catch (e) {
    console.error("Error playing beep:", e)
  }
}

export const playClick = () => {
  playBeep(200, 30, "sawtooth")
}

export const playPrintSound = () => {
  // A series of beeps to simulate data transmission/printing
  let count = 0
  const interval = setInterval(() => {
    playBeep(1200 + Math.random() * 500, 30, "square")
    count++
    if (count > 10) clearInterval(interval)
  }, 80)
}
