import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ImageOff, MapPin } from 'lucide-react'
import { UNSPLASH_URL } from '../../config/stockGalleryImages.js'

function PhotoCredit({ credit, className = '' }) {
  return (
    <p className={`text-xs ${className}`}>
      Photo by{' '}
      <a href={credit.authorUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
        {credit.author}
      </a>{' '}
      on{' '}
      <a href={UNSPLASH_URL} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
        Unsplash
      </a>
    </p>
  )
}

function GalleryThumb({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden text-left w-full"
    >
      {item.image ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.image})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-navy-900/5 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-navy-900/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center gap-1 text-white text-sm font-medium">
        {!item.credit && <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>{item.caption}</span>
      </div>
    </button>
  )
}

function ServiceGallery({ items }) {
  const [openIndex, setOpenIndex] = useState(null)
  const isOpen = openIndex !== null

  const close = useCallback(() => setOpenIndex(null), [])
  const showPrev = useCallback(
    () => setOpenIndex((i) => (i - 1 + items.length) % items.length),
    [items.length]
  )
  const showNext = useCallback(
    () => setOpenIndex((i) => (i + 1) % items.length),
    [items.length]
  )

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close, showPrev, showNext])

  const active = isOpen ? items[openIndex] : null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div key={item.filename}>
            <GalleryThumb item={item} onOpen={() => setOpenIndex(index)} />
            {item.credit && <PhotoCredit credit={item.credit} className="text-gray-500 mt-2" />}
          </div>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy-900/95 flex items-center justify-center p-4 sm:p-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showPrev() }}
            className="absolute left-2 sm:left-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-navy-800">
              {active.image ? (
                <img src={active.image} alt={active.caption} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-12 h-12 text-white/20" />
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mt-4 flex items-center justify-center gap-1.5">
              {!active.credit && <MapPin className="w-3.5 h-3.5" />}
              {active.caption}
            </p>
            {active.credit && <PhotoCredit credit={active.credit} className="text-white/50 text-center mt-1" />}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); showNext() }}
            className="absolute right-2 sm:right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  )
}

export default ServiceGallery
