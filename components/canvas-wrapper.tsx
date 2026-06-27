"use client"

import type React from "react"
import { useRef, useEffect, useCallback, useState } from "react"
import { useMotionValue } from "framer-motion"
import { CanvasControls } from "./canvas-controls"

const MIN_SCALE = 0.25
const MAX_SCALE = 3.0

export function CanvasWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scale = useMotionValue(1)
  const panX = useMotionValue(0)
  const panY = useMotionValue(0)
  const isSpaceHeld = useRef(false)
  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const [displayScale, setDisplayScale] = useState(1)
  const [transform, setTransform] = useState("translate(0px, 0px) scale(1)")
  const [cursor, setCursor] = useState("")

  // Subscribe to motion value changes for reactive transform
  useEffect(() => {
    const update = () => {
      setTransform(`translate(${panX.get()}px, ${panY.get()}px) scale(${scale.get()})`)
    }
    const unsubX = panX.on("change", update)
    const unsubY = panY.on("change", update)
    const unsubS = scale.on("change", update)
    return () => { unsubX(); unsubY(); unsubS() }
  }, [panX, panY, scale])

  // Subscribe to scale changes for display
  useEffect(() => {
    const unsub = scale.on("change", (v) => setDisplayScale(v))
    return unsub
  }, [scale])

  // Keyboard listeners for space key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        isSpaceHeld.current = true
        setCursor("grab")
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpaceHeld.current = false
        isPanning.current = false
        setCursor("")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  // Wheel zoom (centered on cursor)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const currentScale = scale.get()
    const delta = -e.deltaY * 0.001
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale * (1 + delta)))

    if (newScale !== currentScale) {
      const newPanX = mouseX - ((mouseX - panX.get()) / currentScale) * newScale
      const newPanY = mouseY - ((mouseY - panY.get()) / currentScale) * newScale
      scale.set(newScale)
      panX.set(newPanX)
      panY.set(newPanY)
    }
  }, [scale, panX, panY])

  // Bind wheel event (passive: false needed for preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  // Mouse handlers for space+drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpaceHeld.current) {
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      setCursor("grabbing")
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      panX.set(panX.get() + dx)
      panY.set(panY.get() + dy)
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    if (isPanning.current) {
      isPanning.current = false
      setCursor(isSpaceHeld.current ? "grab" : "")
    }
  }

  const resetZoom = () => {
    scale.set(1)
    panX.set(0)
    panY.set(0)
  }

  return (
    <div
      ref={containerRef}
      className={`flex-grow relative overflow-hidden ${cursor}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform,
          transformOrigin: "0 0",
          pointerEvents: isPanning.current ? "none" : undefined,
        }}
      >
        {children}
      </div>
      <CanvasControls scale={displayScale} onReset={resetZoom} />
    </div>
  )
}
