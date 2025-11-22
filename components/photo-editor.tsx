"use client"

import { useState, useRef, useEffect } from "react"
import { X, RotateCw, Sparkles, Heart, Flower2, Star, Check, Sliders } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onClose: () => void
}

export function PhotoEditor({ imageUrl, onSave, onClose }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [warmth, setWarmth] = useState(0)
  const [grain, setGrain] = useState(0) // Added grain state
  const [lightLeak, setLightLeak] = useState<"none" | "left" | "right" | "warm">("none") // Added light leak state
  const [rotation, setRotation] = useState(0)
  const [filter, setFilter] = useState<"none" | "soft" | "rose" | "dreamy" | "vintage" | "noir" | "fade">("none") // Added new filters
  const [borderStyle, setBorderStyle] = useState<"none" | "white" | "floral" | "scalloped" | "tape">("none")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas size with padding for borders
      const padding = borderStyle === "none" ? 0 : 60 // Increased padding for better aesthetic
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw Background/Border
      if (borderStyle !== "none") {
        ctx.fillStyle = "#fffaf0" // Cream background
        if (borderStyle === "white") ctx.fillStyle = "#ffffff"

        if (borderStyle !== "white") {
          const patternCanvas = document.createElement("canvas")
          patternCanvas.width = 100
          patternCanvas.height = 100
          const pCtx = patternCanvas.getContext("2d")
          if (pCtx) {
            pCtx.fillStyle = "#fffaf0"
            pCtx.fillRect(0, 0, 100, 100)
            pCtx.fillStyle = "rgba(0,0,0,0.02)"
            for (let i = 0; i < 50; i++) {
              pCtx.fillRect(Math.random() * 100, Math.random() * 100, 1, 1)
            }
            const pattern = ctx.createPattern(patternCanvas, "repeat")
            if (pattern) ctx.fillStyle = pattern
          }
        }

        // Draw base background
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Decorative border elements
        if (borderStyle === "scalloped") {
          ctx.strokeStyle = "#ffd1dc"
          ctx.lineWidth = 10
          ctx.beginPath()
          ctx.roundRect(15, 15, canvas.width - 30, canvas.height - 30, 10) // Uses roundRect
          ctx.stroke()
        } else if (borderStyle === "floral") {
          ctx.strokeStyle = "#e6ccb2"
          ctx.lineWidth = 2
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
        }
      }

      // Apply Image Transformations
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)

      // Adjust draw position based on rotation to keep centered
      const drawWidth = img.width
      const drawHeight = img.height

      if (borderStyle !== "none") {
        ctx.shadowColor = "rgba(0,0,0,0.1)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 5
      }

      // Apply filters
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

      // Warmth simulation via sepia
      if (warmth > 0) {
        filterString += ` sepia(${warmth * 0.4}%)`
      }

      if (filter === "noir") {
        filterString += ` grayscale(100%) contrast(120%)`
      } else if (filter === "fade") {
        filterString += ` opacity(90%) brightness(110%) sepia(20%)`
      }

      ctx.filter = filterString

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Apply Soft Overlay Filters
      if (filter !== "none") {
        ctx.globalCompositeOperation = "overlay" // Blend mode for softer effect

        if (filter === "soft") {
          ctx.fillStyle = "rgba(255, 220, 230, 0.2)" // Soft pink tint
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else if (filter === "rose") {
          ctx.fillStyle = "rgba(255, 182, 193, 0.3)" // Rose tint
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else if (filter === "dreamy") {
          ctx.fillStyle = "rgba(230, 230, 255, 0.2)" // Cool misty tint
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else if (filter === "vintage") {
          ctx.fillStyle = "rgba(255, 230, 180, 0.3)" // Warm vintage tint
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        }

        // Reset composite operation
        ctx.globalCompositeOperation = "source-over"
      }

      if (lightLeak !== "none") {
        ctx.globalCompositeOperation = "screen"
        const leakGradient = ctx.createLinearGradient(-drawWidth / 2, -drawHeight / 2, drawWidth / 2, drawHeight / 2)

        if (lightLeak === "left") {
          const g = ctx.createLinearGradient(-drawWidth / 2, 0, 0, 0)
          g.addColorStop(0, "rgba(255, 150, 100, 0.4)")
          g.addColorStop(1, "rgba(255, 150, 100, 0)")
          ctx.fillStyle = g
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else if (lightLeak === "right") {
          const g = ctx.createLinearGradient(drawWidth / 4, 0, drawWidth / 2, 0)
          g.addColorStop(0, "rgba(0,0,0,0)")
          g.addColorStop(1, "rgba(255, 200, 150, 0.5)")
          ctx.fillStyle = g
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        } else if (lightLeak === "warm") {
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(drawWidth, drawHeight))
          g.addColorStop(0, "rgba(255, 200, 100, 0.1)")
          g.addColorStop(1, "rgba(255, 100, 50, 0)")
          ctx.fillStyle = g
          ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        }
        ctx.globalCompositeOperation = "source-over"
      }

      if (grain > 0) {
        ctx.globalCompositeOperation = "overlay"
        const grainCanvas = document.createElement("canvas")
        grainCanvas.width = 100
        grainCanvas.height = 100
        const gCtx = grainCanvas.getContext("2d")
        if (gCtx) {
          const imageData = gCtx.createImageData(100, 100)
          const buffer = new Uint32Array(imageData.data.buffer)
          const len = buffer.length
          const grainAlpha = Math.floor((grain / 100) * 255)

          for (let i = 0; i < len; i++) {
            if (Math.random() < 0.5) {
              // Little gray noise
              buffer[i] = (grainAlpha << 24) | (128 << 16) | (128 << 8) | 128
            }
          }
          gCtx.putImageData(imageData, 0, 0)

          const pattern = ctx.createPattern(grainCanvas, "repeat")
          if (pattern) {
            ctx.fillStyle = pattern
            ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
          }
        }
        ctx.globalCompositeOperation = "source-over"
      }

      ctx.restore()
    }
    img.src = imageUrl
  }, [imageUrl, brightness, contrast, saturation, warmth, grain, lightLeak, rotation, filter, borderStyle])

  const handleSave = () => {
    if (canvasRef.current) {
      const editedUrl = canvasRef.current.toDataURL("image/png")
      onSave(editedUrl)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#fffbf7] rounded-[2rem] shadow-[0_20px_60px_rgba(200,180,180,0.25)] border border-[#efe5e5] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Elegant & Soft */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-[#f0e6e6] bg-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-400">
                <Sparkles size={16} />
              </div>
              <h2 className="font-serif text-xl text-[#5a4a4a] tracking-wide">Photo Studio</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Preview Canvas Area - Light & Airy */}
            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#fdfbfb] p-8 flex items-center justify-center overflow-hidden relative">
              {/* Decorative background elements */}
              <div className="absolute top-10 left-10 text-pink-100 opacity-50 pointer-events-none">
                <Star size={40} />
              </div>
              <div className="absolute bottom-10 right-10 text-yellow-100 opacity-50 pointer-events-none">
                <Flower2 size={60} />
              </div>

              <motion.div
                layout
                className="relative shadow-xl rounded-sm overflow-hidden"
                style={{ boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[60vh] object-contain"
                  style={{
                    transform: `scale(1)`, // Simplified for stability
                    transition: "all 0.3s ease",
                  }}
                />
              </motion.div>
            </div>

            {/* Controls Panel - Feminine UI */}
            <div className="w-full lg:w-[360px] bg-white border-l border-[#f0e6e6] flex flex-col overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-8">
                {/* Filter Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} className="text-pink-400" />
                    <label className="text-xs font-bold uppercase text-[#8a7a7a] tracking-widest">Atmosphere</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "none", label: "Natural" },
                      { id: "soft", label: "Soft" },
                      { id: "rose", label: "Rose" },
                      { id: "dreamy", label: "Dreamy" },
                      { id: "vintage", label: "Retro" },
                      { id: "noir", label: "Noir" }, // Added Noir
                      { id: "fade", label: "Fade" }, // Added Fade
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-2 py-3 text-xs rounded-xl border transition-all font-medium ${
                          filter === f.id
                            ? "border-pink-200 bg-pink-50 text-pink-700 shadow-sm"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-pink-100 hover:bg-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light Leaks Section - Added Light Leaks UI */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={14} className="text-pink-400" />
                    <label className="text-xs font-bold uppercase text-[#8a7a7a] tracking-widest">Light Leaks</label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "none", label: "None" },
                      { id: "left", label: "Left" },
                      { id: "right", label: "Right" },
                      { id: "warm", label: "Warm" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLightLeak(l.id as any)}
                        className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                          lightLeak === l.id
                            ? "border-pink-300 bg-pink-50 text-pink-700"
                            : "border-gray-100 text-gray-500 hover:border-pink-200"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders - Custom Styled */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sliders size={14} className="text-pink-400" />
                    <label className="text-xs font-bold uppercase text-[#8a7a7a] tracking-widest">Adjustments</label>
                  </div>

                  {[
                    { label: "Brightness", value: brightness, set: setBrightness, min: 50, max: 150 },
                    { label: "Contrast", value: contrast, set: setContrast, min: 50, max: 150 },
                    { label: "Warmth", value: warmth, set: setWarmth, min: 0, max: 100 },
                    { label: "Grain", value: grain, set: setGrain, min: 0, max: 100 }, // Added Grain Slider
                  ].map((control) => (
                    <div key={control.label} className="group">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">{control.label}</span>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {control.value}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        value={control.value}
                        onChange={(e) => control.set(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300 transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* Borders */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart size={14} className="text-pink-400" />
                    <label className="text-xs font-bold uppercase text-[#8a7a7a] tracking-widest">Frames</label>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {[
                      { id: "none", label: "None" },
                      { id: "white", label: "Polaroid" },
                      { id: "scalloped", label: "Scallop" },
                      { id: "floral", label: "Floral" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBorderStyle(b.id as any)}
                        className={`flex-shrink-0 px-4 py-2 text-xs rounded-full border transition-all font-medium ${
                          borderStyle === b.id
                            ? "border-pink-300 bg-pink-50 text-pink-700 ring-1 ring-pink-200"
                            : "border-gray-200 text-gray-500 hover:border-pink-200 hover:text-pink-400"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotate Tool */}
                <button
                  onClick={handleRotate}
                  className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs font-medium hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw size={14} />
                  <span>Rotate Photo</span>
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto p-6 border-t border-[#f0e6e6] bg-gray-50/50 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-white hover:text-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-medium shadow-lg shadow-pink-200 hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Save Design</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
