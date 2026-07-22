import React, { useState, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useContactPhone } from '../../hooks/useContactPhone.js'

const quickReplies = [
  { id: 'quote', label: 'Get a free quote' },
  { id: 'emergency', label: 'Emergency call-out' },
  { id: 'services', label: 'See our services' },
  { id: 'team', label: 'Talk to the team' }
]

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const { openWhatsApp } = useContactPhone()

  // Show sticky CTA after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 400)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleQuickReply = (replyId) => {
    const messages = {
      quote: 'Hi, I\'d like to get a free quote for some work on my property.',
      emergency: 'Hi, I have an emergency and need help urgently.',
      services: 'Hi, could you tell me more about your services?',
      team: 'Hi, I\'d like to speak with someone from your team.'
    }
    openWhatsApp(messages[replyId])
    setIsOpen(false)
  }

  return (
    <>
      {/* Sticky CTA Chip */}
      {showStickyCTA && !isOpen && (
        <button
          onClick={() => openWhatsApp('Hi, I\'d like to get an instant quote.')}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-white text-navy-900 text-sm font-medium rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 lg:bottom-6"
        >
          Get an instant quote
          <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-navy-800 rotate-90' : 'bg-navy-900 hover:bg-navy-800'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-navy-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-navy-800 p-4 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-whatsapp rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp border-2 border-navy-800 rounded-full" />
            </div>
            <div>
              <h4 className="text-white font-semibold">PSR Assistant</h4>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online · instant reply
              </p>
            </div>
          </div>

          {/* Message Area */}
          <div className="p-4 bg-navy-900">
            <div className="bg-navy-800 rounded-2xl rounded-tl-none p-4 mb-4">
              <p className="text-gray-200 text-sm leading-relaxed">
                Hi there! I'm PSR's assistant. I can help you get an instant quote or answer questions about our services. What can I help you with today?
              </p>
            </div>

            {/* Quick Replies */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.id)}
                  className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-gray-200 text-xs font-medium rounded-full transition-colors duration-200 text-center"
                >
                  {reply.label}
                </button>
              ))}
            </div>

            {/* Input Area (Visual Only) */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-navy-800 text-white text-sm rounded-full border border-navy-700 placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    openWhatsApp(e.target.value)
                    setIsOpen(false)
                  }
                }}
              />
              <button 
                className="w-10 h-10 bg-whatsapp rounded-full flex items-center justify-center hover:bg-whatsapp-light transition-colors"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type a message..."]')
                  if (input && input.value.trim()) {
                    openWhatsApp(input.value)
                    setIsOpen(false)
                  }
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={() => {
                openWhatsApp('Hi, I contacted you through your website chat.')
                setIsOpen(false)
              }}
              className="w-full py-3 bg-whatsapp hover:bg-whatsapp-light text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Continue on WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget