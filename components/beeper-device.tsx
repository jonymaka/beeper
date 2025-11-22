"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Trash2, Printer, Camera, Type } from "lucide-react"
import { playBeep, playClick, playPrintSound } from "@/lib/utils"
import type { FontType } from "./paper-card"

interface BeeperDeviceProps {
  onPrint: (text: string) => void
  onPhotoClick: () => void
  currentFont: FontType
  onFontChange: (font: FontType) => void
}

export function BeeperDevice({ onPrint, onPhotoClick, currentFont, onFontChange }: BeeperDeviceProps) {
  const [input, setInput] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [systemMessage, setSystemMessage] = useState<string | null>(null) // New state for feedback
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle typing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length > input.length) {
      playClick()
    } else {
      playBeep(150, 20, "sawtooth")
    }
    setInput(newValue)
  }

  const handlePrint = () => {
    if (!input.trim()) return
    playPrintSound()
    onPrint(input)

    // Show sent feedback
    setSystemMessage("TRANSMITTING...")
    setTimeout(() => setSystemMessage(null), 1500)

    setInput("")
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleClear = () => {
    playBeep(100, 100, "sawtooth")
    setInput("")
    if (textareaRef.current) textareaRef.current.focus()
  }

  const cycleFont = () => {
    playBeep(400, 50, "sine")
    // Updated font cycling list
    const fonts: FontType[] = ["classic", "modern", "rough", "elegant"]
    const currentIndex = fonts.indexOf(currentFont)
    const nextIndex = (currentIndex + 1) % fonts.length
    const newFont = fonts[nextIndex]

    onFontChange(newFont)

    // Bilingual font feedback
    const fontNames = {
      classic: "SERIF 宋体",
      modern: "SANS 黑体",
      rough: "ROUGH 狂草",
      elegant: "SCRIPT 花体",
    }
    setSystemMessage(`FONT: ${fontNames[newFont]}`)
    setTimeout(() => setSystemMessage(null), 1000)
  }

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  const getFontLabel = (font: FontType) => {
    // Short codes for the small screen
    switch (font) {
      case "classic":
        return "宋 A"
      case "modern":
        return "黑 B"
      case "rough":
        return "草 C"
      case "elegant":
        return "花 D"
    }
  }

  return (
    <div className="relative w-[95%] md:w-full max-w-[420px] mx-auto transition-all duration-300">
      {/* The Green Case */}
      <div className="bg-[#8cc63f] rounded-[24px] md:rounded-[32px] p-4 sm:p-6 pb-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_-8px_12px_rgba(0,0,0,0.2),inset_0_4px_8px_rgba(255,255,255,0.4)] relative z-10 transform transition-transform hover:scale-[1.005]">
        {/* Top Label Area */}
        <div className="flex justify-between items-center mb-3 px-2 opacity-60 font-mono text-[9px] font-bold tracking-wider text-[#1a330a]">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            AUTO-FEED
          </div>
          <div className="flex items-center gap-2">
            <span>SERIES 9000</span>
            <span>📶 5G</span>
          </div>
        </div>

        {/* Screen Bezel */}
        <div className="bg-[#0a1205] rounded-[12px] md:rounded-[16px] p-3 sm:p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] mb-6 relative border-b-2 border-[#ffffff10]">
          {/* Screen Glare Reflection */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none rounded-r-[16px]"></div>

          <div className="flex justify-between text-[#2a5a35] text-[9px] font-mono mb-1 select-none">
            <span>compose_mode</span>
            <span className="flex gap-2">
              <span className="text-[#33ff00] opacity-80">FONT: {getFontLabel(currentFont)}</span>
              <span>🔋</span>
            </span>
          </div>

          {/* The "Display" Input */}
          <div className="relative min-h-[80px] h-[80px]">
            {systemMessage ? (
              // System Message Overlay
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a1205]/90 z-20 animate-in fade-in duration-200">
                <span className="text-[#33ff00] font-screen text-lg font-bold tracking-widest animate-pulse">
                  {systemMessage}
                </span>
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full h-full bg-transparent text-[#33ff00] font-screen text-lg sm:text-xl outline-none border-none resize-none placeholder-[#33ff00]/30 tracking-wider screen-scrollbar selection:bg-[#33ff00] selection:text-black uppercase shadow-none leading-relaxed font-medium"
              placeholder="TYPE MESSAGE..."
              spellCheck={false}
            />

            {/* Cursor Blinker (Custom) */}
            {isFocused && !systemMessage && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#33ff00] animate-pulse opacity-50 pointer-events-none rounded-full"></span>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex items-center justify-between px-1 md:px-2 gap-2">
          {/* Left Buttons Group */}
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={onPhotoClick}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1f211e] shadow-[0_4px_0_#000,0_6px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-gray-400 transition-all hover:text-[#8cc63f] group border-2 border-[#333]"
              aria-label="Add Photo"
              title="Add Photo"
            >
              <Camera size={16} className="group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={cycleFont}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1f211e] shadow-[0_4px_0_#000,0_6px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-gray-400 transition-all hover:text-white group border-2 border-[#333]"
              aria-label="Change Font"
              title="Change Font"
            >
              <Type size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleClear}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1f211e] shadow-[0_4px_0_#000,0_6px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-gray-400 transition-all hover:text-red-400 group border-2 border-[#333]"
              aria-label="Clear"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Speaker Grill Decoration - Hidden on very small screens */}
          <div className="hidden md:flex flex-col gap-1 opacity-20">
            <div className="w-12 h-0.5 bg-black rounded-full"></div>
            <div className="w-12 h-0.5 bg-black rounded-full"></div>
            <div className="w-12 h-0.5 bg-black rounded-full"></div>
          </div>

          {/* Print Button (Big Orange Button) */}
          <button
            onClick={handlePrint}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-[#ff5500] rounded-lg shadow-[0_4px_0_#cc3300,0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] active:translate-y-[4px] active:shadow-none flex items-center gap-2 font-bold text-[#3d1405] text-xs sm:text-sm tracking-widest transition-all hover:brightness-110 whitespace-nowrap"
          >
            <span>PRINT</span>
            <Printer size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Branding Label */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#1a330a] px-2 py-0.5 rounded text-[7px] font-bold tracking-[0.2em] text-[#8cc63f] shadow-inner">
          MOTOROLA
        </div>
      </div>

      {/* Device Shadow/Reflection on desk */}
      <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/20 blur-lg rounded-[50%] -z-10"></div>
    </div>
  )
}
