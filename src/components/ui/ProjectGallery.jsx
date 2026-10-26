import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, MapPin, Images, Expand } from 'lucide-react'

// Tiles shown in the grid before collapsing the rest into a "+N" tile
const VISIBLE_TILES = 5
const SWIPE_THRESHOLD = 50

function GalleryTile({ photo, featured, hiddenCount, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={photo.alt}
      className={`group relative overflow-hidden rounded-xl bg-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        featured ? 'col-span-2 row-span-2 aspect-[4/5] lg:aspect-auto' : 'aspect-[3/4]'
      }`}
    >
      <img
        src={photo.thumb}
        alt={photo.alt}
        width="600"
        height="800"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-navy-900/0 transition-colors duration-300 group-hover:bg-navy-900/30" />

      {hiddenCount > 0 ? (
        <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
          <span className="text-3xl font-black">+{hiddenCount}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">View all</span>
        </div>
      ) : (
        <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Expand className="w-4 h-4" />
        </span>
      )}
    </button>
  )
}

function Lightbox({ album, index, onClose, onPrev, onNext, onSelect }) {
  const closeRef = useRef(null)
  const thumbsRef = useRef(null)
  const touchStartX = useRef(null)
  const photo = album.photos[index]
  const total = album.photos.length

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onPrev, onNext])

  // Preload neighbours so arrow navigation feels instant
  useEffect(() => {
    if (total < 2) return
    ;[index + 1, index - 1].forEach((i) => {
      const img = new window.Image()
      img.src = album.photos[(i + total) % total].src
    })
  }, [album, index, total])

  useEffect(() => {
    thumbsRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > SWIPE_THRESHOLD) onPrev()
    if (delta < -SWIPE_THRESHOLD) onNext()
    touchStartX.current = null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-navy-900/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={album.title}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="font-bold truncate">{album.title}</p>
          <p className="text-white/60 text-sm" aria-live="polite">
            {index + 1} / {total}
          </p>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-fade-in"
        />

        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev() }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext() }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Caption + thumbnails */}
      <div className="px-4 sm:px-6 pt-3 pb-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-white/80 text-sm text-center mb-3 line-clamp-2">{photo.alt}</p>
        {total > 1 && (
          <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center [scrollbar-width:none]">
            {album.photos.map((p, i) => (
              <button
                key={p.src}
                data-index={i}
                onClick={() => onSelect(i)}
                className={`relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden transition-all ${
                  i === index ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-90'
                }`}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
              >
                <img src={p.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function ProjectGallery({ album }) {
  const [openIndex, setOpenIndex] = useState(null)
  const total = album.photos.length

  const close = useCallback(() => setOpenIndex(null), [])
  const showPrev = useCallback(() => setOpenIndex((i) => (i - 1 + total) % total), [total])
  const showNext = useCallback(() => setOpenIndex((i) => (i + 1) % total), [total])

  const visible = album.photos.slice(0, VISIBLE_TILES)
  const hiddenCount = total - visible.length

  return (
    <article>
      {/* Album header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 mb-3 bg-white/10 text-white text-xs font-medium rounded-full">
            {album.category}
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{album.title}</h3>
          <p className="text-white/60 text-sm lg:text-base">{album.description}</p>
        </div>
        <div className="flex items-center gap-4 text-white/60 text-sm flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {album.location}
          </span>
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="flex items-center gap-1.5 text-white hover:text-white/80 font-semibold transition-colors"
          >
            <Images className="w-4 h-4" />
            {total} photos
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((photo, i) => (
          <GalleryTile
            key={photo.src}
            photo={photo}
            featured={i === 0}
            hiddenCount={i === visible.length - 1 ? hiddenCount : 0}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          album={album}
          index={openIndex}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
          onSelect={setOpenIndex}
        />
      )}
    </article>
  )
}

export default ProjectGallery
