"use client"

import type React from "react"

import { motion } from "framer-motion"
import { X, Download, Edit } from "lucide-react"
import { useRef } from "react"
import html2canvas from "html2canvas"

interface PhotoStickerProps {
  id: string
  imageUrl: string
  x: number
  y: number
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  style?: React.CSSProperties
}

export function PhotoSticker({ id, imageUrl, x, y, onDelete, onEdit, style }: PhotoStickerProps) {
  const stickerRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (stickerRef.current) {
      const canvas = await html2canvas(stickerRef.current, {
        backgroundColor: null,
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `photo-sticker-${id}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ scale: 0, rotate: -10, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", damping: 15 }}
      className="absolute z-20 cursor-grab active:cursor-grabbing"
      style={{ left: x, top: y, touchAction: "none", ...style }}
    >
      <div
        ref={stickerRef}
        className="relative group bg-white p-3 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:scale-105"
        style={{
          transform: `rotate(${Math.random() * 6 - 3}deg)`,
        }}
      >
        {/* Polaroid-style photo frame */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Sticker"
            className="w-48 h-48 object-cover select-none pointer-events-none"
            draggable={false}
          />

          {/* Control Buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(id)}
              className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow-md hover:bg-blue-100 transition-colors"
              title="Edit Photo"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={handleDownload}
              className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow-md hover:bg-green-100 transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow-md hover:bg-red-100 transition-colors"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Bottom white space (Polaroid style) */}
        <div className="h-10 bg-white border-t border-gray-100"></div>

        {/* Tape effect on corners */}
        <div className="absolute -top-2 -left-2 w-12 h-6 bg-yellow-100/60 backdrop-blur-sm rotate-45 shadow-sm"></div>
        <div className="absolute -top-2 -right-2 w-12 h-6 bg-yellow-100/60 backdrop-blur-sm -rotate-45 shadow-sm"></div>
      </div>
    </motion.div>
  )
}
