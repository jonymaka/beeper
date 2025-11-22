"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, Download } from "lucide-react" // Added FileDown for visual variance
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"

export type FontType = "classic" | "modern" | "rough" | "elegant"

interface PaperCardProps {
  id: string
  text: string
  date: string
  onDelete: (id: string) => void
  initialPosition?: { x: number; y: number }
  texture?: "plain" | "crumpled" | "grid"
  font?: FontType // Added font prop
  style?: React.CSSProperties
}

export function PaperCard({
  id,
  text,
  date,
  onDelete,
  initialPosition,
  texture = "plain",
  font = "classic", // Default font
  style,
}: PaperCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("")
    setIsTyping(true)

    let index = 0
    const characters = Array.from(text) // Handle emojis and complex characters correctly

    const interval = setInterval(() => {
      if (index < characters.length) {
        // Use slice instead of appending to prev state to avoid race conditions or missing characters
        setDisplayedText(characters.slice(0, index + 1).join(""))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 50) // Adjusted speed for better readability

    return () => clearInterval(interval)
  }, [text])

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution
      })
      const link = document.createElement("a")
      link.download = `fax-message-${id}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  const textureClasses = {
    plain: "bg-[#fdfbf7] shadow-inner", // Made plain slightly off-white for realism
    crumpled: "bg-[#f0f0f0] bg-[url('https://www.transparenttextures.com/patterns/crumpled-paper.png')]",
    grid: "bg-white bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]",
  }

  const fontStyles = {
    classic: { fontFamily: "var(--font-stack-classic)", lineHeight: "1.6" },
    modern: { fontFamily: "var(--font-stack-modern)", lineHeight: "2", letterSpacing: "0.05em" },
    rough: { fontFamily: "var(--font-stack-rough)", letterSpacing: "-0.02em", fontSize: "1.125rem" },
    elegant: { fontFamily: "var(--font-stack-elegant)", fontSize: "1.5rem", lineHeight: "1.6" },
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      // Using initialPosition if provided, otherwise defaulting to a "coming out of printer" animation
      initial={initialPosition || { y: 300, opacity: 0, scale: 0.9 }} // Start from "inside" (lower Y)
      animate={{ y: 0, opacity: 1, scale: 1 }} // Move up to natural position (0 relative to top/left set in style)
      transition={{ duration: 1.5, type: "spring", damping: 20, stiffness: 100 }}
      className="absolute z-20 cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none", ...style }} // Apply external positioning
    >
      <div
        ref={cardRef}
        className={cn(
          "relative w-auto max-w-[400px] min-w-[300px] shadow-xl text-black p-0 group transition-transform hover:scale-[1.01]",
          // Dynamic font class is applied to the text container, not here
        )}
      >
        {/* Top Jagged Edge */}
        <div className="h-4 w-full relative overflow-hidden">
          <div
            className={cn("absolute bottom-[-16px] w-full h-8 transform rotate-180", textureClasses[texture])}
            style={{
              clipPath:
                "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className={cn("px-8 py-8 flex flex-col relative", textureClasses[texture])}>
          {/* Paper Texture Overlay for realism */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] mix-blend-multiply"></div>

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-900/5 pb-2 mb-4 select-none relative z-10">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Pager Message</div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                title="Save as Image"
                className="text-gray-400 hover:text-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => onDelete(id)}
                title="Discard"
                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-4 select-none relative z-10">
            <span>NO. {id.slice(0, 4).toUpperCase()}</span>
            <span>{date}</span>
          </div>

          {/* The Message */}
          <div
            className="whitespace-pre-wrap break-words flex-grow text-gray-900 font-medium min-h-[3rem] relative z-10"
            style={fontStyles[font]} // Applying font family via inline style to guarantee stack validity
          >
            {displayedText}
            {isTyping && <span className="animate-pulse inline-block w-1.5 h-5 align-middle bg-black/50 ml-0.5" />}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-gray-300 flex justify-between items-end select-none relative z-10">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-1 w-24 bg-gray-200 rounded-full"></div>
            </div>
            <div className="text-[8px] uppercase text-gray-400 tracking-widest">End of Transmission</div>
          </div>
        </div>

        {/* Bottom Jagged Edge */}
        <div className="h-4 w-full relative overflow-hidden">
          <div
            className={cn("absolute top-[-16px] w-full h-8", textureClasses[texture])}
            style={{
              clipPath:
                "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}
