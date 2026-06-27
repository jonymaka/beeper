"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { loadAll, saveAll } from "@/lib/db"
import { BeeperDevice } from "@/components/beeper-device"
import { PaperCard, type FontType, type TextureType } from "@/components/paper-card"
import { PhotoSticker } from "@/components/photo-sticker"
import { PhotoEditor } from "@/components/photo-editor"
import { Settings } from "lucide-react"
import { CanvasWrapper } from "@/components/canvas-wrapper"

interface Message {
  id: string
  text: string
  date: string
  x: number
  y: number
  texture: TextureType
  font: FontType // Added font field
}

interface Photo {
  id: string
  imageUrl: string
  x: number
  y: number
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentTexture, setCurrentTexture] = useState<TextureType>("plain")
  const [currentFont, setCurrentFont] = useState<FontType>("classic") // Updated default
  const [showSettings, setShowSettings] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<{ id: string; url: string } | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loaded, setLoaded] = useState(false)
  const restoredIds = useRef(new Set<string>())

  useEffect(() => {
    Promise.all([loadAll<Message>("messages"), loadAll<Photo>("photos")]).then(
      ([savedMessages, savedPhotos]) => {
        savedMessages.forEach((m) => restoredIds.current.add(m.id))
        setMessages(savedMessages)
        setPhotos(savedPhotos)
        setLoaded(true)
      }
    )
  }, [])

  const save = useCallback(
    (msgs: Message[], phs: Photo[]) => {
      if (!loaded) return
      saveAll("messages", msgs)
      saveAll("photos", phs)
    },
    [loaded]
  )

  useEffect(() => {
    save(messages, photos)
  }, [messages, photos, save])

  const handlePrint = (text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      date: new Date().toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      x: window.innerWidth / 2 - 160 + (Math.random() * 20 - 10),
      y: window.innerHeight / 2 - 100,
      texture: currentTexture,
      font: currentFont, // Use current font
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const handleMoveMessage = (id: string, x: number, y: number) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, x, y } : m)))
  }

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleMovePhoto = (id: string, x: number, y: number) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setPendingPhoto(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSave = (editedImageUrl: string) => {
    const newPhoto: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: editedImageUrl,
      x: window.innerWidth / 2 - 100,
      y: 100 + photos.length * 50,
    }
    setPhotos((prev) => [...prev, newPhoto])
    setPendingPhoto(null)
  }

  const handleEditPhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id)
    if (photo) {
      setEditingPhoto({ id, url: photo.imageUrl })
    }
  }

  const handleUpdatePhoto = (editedImageUrl: string) => {
    if (editingPhoto) {
      setPhotos((prev) => prev.map((p) => (p.id === editingPhoto.id ? { ...p, imageUrl: editedImageUrl } : p)))
      setEditingPhoto(null)
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#e6e4dd] bg-grid-pattern relative flex flex-col overflow-hidden selection:bg-green-200">
      {/* Retro Noise Overlay */}
      <div className="retro-noise"></div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

      {/* Header Branding - Styled as a label */}
      <header className="absolute top-8 left-1/2 -translate-x-1/2 w-auto z-0 pointer-events-none opacity-80 rotate-[-1deg]">
        <div className="border-4 border-double border-gray-300 p-4 bg-[#f4f1ea] shadow-sm rounded-sm transform skew-x-1">
          <h1 className="font-screen text-4xl md:text-6xl tracking-tighter text-gray-800 uppercase drop-shadow-sm flex items-center gap-3">
            <span className="text-green-600">⚡</span> Gemini
          </h1>
          <p className="font-mono text-[10px] md:text-xs tracking-[0.6em] text-gray-500 mt-1 text-center border-t border-gray-300 pt-1">
            DIGITAL PAGINATION SYSTEM
          </p>
        </div>
      </header>

      {/* Desk Controls - Styled as physical objects */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-4 items-end">
        {/* Upload "Polaroid" Button */}
        <div className="relative group">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white p-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_12px_rgba(0,0,0,0.15)] transition-all transform hover:-rotate-2 hover:scale-105 active:scale-95 border border-gray-100 w-16 h-16 flex flex-col items-center justify-center gap-1"
            title="Upload Photo"
          >
            <div className="w-8 h-6 bg-gray-800 rounded-sm relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#222] rounded-full border-2 border-gray-600"></div>
            </div>
            <span className="text-[8px] font-mono text-gray-500 font-bold">PHOTO</span>
          </button>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Add Photo
          </span>
        </div>

        {/* Settings "Gear" */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`bg-[#d1d5db] p-3 rounded-full shadow-[0_4px_0_#9ca3af,0_6px_6px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all border-2 border-gray-400 text-gray-600 hover:text-gray-800 ${showSettings ? "translate-y-[4px] shadow-none bg-gray-300" : ""}`}
            title="Settings"
          >
            <Settings size={20} className={`${showSettings ? "rotate-90" : ""} transition-transform duration-500`} />
          </button>

          {showSettings && (
            <div className="absolute right-14 top-0 bg-[#fdfbf7] rounded shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-4 w-48 border border-gray-200 animate-in fade-in slide-in-from-right-2 rotate-1 origin-top-right before:content-[''] before:absolute before:right-[-6px] before:top-4 before:w-3 before:h-3 before:bg-[#fdfbf7] before:rotate-45 before:border-t before:border-r before:border-gray-200">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-dashed border-gray-200 pb-2">
                Stationery Type
              </h3>
              <div className="space-y-1">
                {(["plain", "crumpled", "grid", "lined", "vintage", "kraft", "dots", "crosshatch"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCurrentTexture(type)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wide rounded transition-colors flex items-center justify-between ${
                      currentTexture === type
                        ? "bg-green-50 text-green-700 font-bold border border-green-100"
                        : "hover:bg-gray-100 text-gray-600 border border-transparent"
                    }`}
                  >
                    <span>{type}</span>
                    {currentTexture === type && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CanvasWrapper>
        {messages.map((msg) => (
          <PaperCard
            key={msg.id}
            id={msg.id}
            text={msg.text}
            date={msg.date}
            x={msg.x}
            y={msg.y}
            onDelete={handleDeleteMessage}
            onMove={handleMoveMessage}
            entrance={!restoredIds.current.has(msg.id)}
            texture={msg.texture}
            font={msg.font}
          />
        ))}

        {photos.map((photo) => (
          <PhotoSticker
            key={photo.id}
            id={photo.id}
            imageUrl={photo.imageUrl}
            x={photo.x}
            y={photo.y}
            onDelete={handleDeletePhoto}
            onEdit={handleEditPhoto}
            onMove={handleMovePhoto}
          />
        ))}
      </CanvasWrapper>

      {/* The Beeper Device Fixed at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-4 flex justify-center items-end pointer-events-none">
        <BeeperDevice
          onPrint={handlePrint}
          onPhotoClick={() => fileInputRef.current?.click()}
          currentFont={currentFont}
          onFontChange={setCurrentFont}
        />
      </div>

      {/* Photo Editor Modal */}
      {pendingPhoto && (
        <PhotoEditor imageUrl={pendingPhoto} onSave={handlePhotoSave} onClose={() => setPendingPhoto(null)} />
      )}

      {editingPhoto && (
        <PhotoEditor imageUrl={editingPhoto.url} onSave={handleUpdatePhoto} onClose={() => setEditingPhoto(null)} />
      )}

      {/* Overlay Vignette for retro feel */}
      <div className="retro-vignette absolute inset-0 pointer-events-none z-40 mix-blend-multiply"></div>
    </main>
  )
}
