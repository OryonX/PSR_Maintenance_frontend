import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'
import { buildSystemPrompt } from '../../config/chatPrompt.js'


// n8n chat workflow: the widget sends chatInput + sessionId + systemPrompt and
// n8n answers with { respuesta, create_lead, datos_suficientes_para_crm, lead, ... }.
// The lead itself is created server-side by n8n — the widget only reads the flags.
const CHAT_WEBHOOK_URL = import.meta.env.VITE_CHAT_WEBHOOK_URL
  || 'https://n8n.diegoalejandrojs.com/webhook/psr-webhook-chat'
const ORGANIZATION_SLUG = 'psr-maintenance'
const LANG = 'en'


const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 60 * 1000
const TIMEOUT_MS = 30000
const STORAGE_KEY = 'psr_chat_limit'
const SESSION_KEY = 'psr_session_id'

const quickReplyIds = ['quote', 'emergency', 'services', 'team']

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = 'psr_' + crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'psr_' + Math.random().toString(36).slice(2)
  }
}

function readLimit() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function getMessageCount() {
  const data = readLimit()
  if (!data.timestamp || Date.now() - data.timestamp > RATE_WINDOW) return 0
  return data.count || 0
}

function incrementMessageCount() {
  const data = readLimit()
  const now = Date.now()
  const reset = !data.timestamp || now - data.timestamp > RATE_WINDOW
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      count: reset ? 1 : (data.count || 0) + 1,
      timestamp: reset ? now : data.timestamp
    }))
  } catch { /* storage unavailable — limit is best-effort */ }
}

function getUtm() {
  try {
    return JSON.parse(sessionStorage.getItem('psr_utm') || '{}')
  } catch {
    return {}
  }
}

const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

function ChatWidget() {
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('common')

  const [isOpen, setIsOpen] = useState(false)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(() => [
    { type: 'bot', text: t('chatWidget.greeting'), time: nowTime() }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isLimited, setIsLimited] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [leadDone, setLeadDone] = useState(false)
  const [msgCount, setMsgCount] = useState(0)

  const messagesEndRef = useRef(null)
  const sessionIdRef = useRef(null)

  // Browser-only state (localStorage / sessionStorage) is read after mount so
  // the prerender (SSR) doesn't touch window.
  useEffect(() => {
    sessionIdRef.current = getSessionId()
    const count = getMessageCount()
    setMsgCount(count)
    setIsLimited(count >= RATE_LIMIT)
  }, [])

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Real visible height (covers mobile browser bars and the open keyboard)
  const [viewportH, setViewportH] = useState(800)
  useEffect(() => {
    const vv = window.visualViewport
    setViewportH(vv?.height || window.innerHeight)
    const onResize = () => setViewportH(vv?.height || window.innerHeight)
    vv?.addEventListener('resize', onResize)
    window.addEventListener('resize', onResize)
    return () => {
      vv?.removeEventListener('resize', onResize)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const remaining = Math.max(0, RATE_LIMIT - msgCount)

  const addMessage = (type, text) => {
    setMessages((prev) => [...prev, { type, text, time: nowTime() }])
  }

  const handleSend = async (text) => {
    const input = (text || message).trim()
    if (!input || isLoading || isLimited || leadDone) return

    if (getMessageCount() >= RATE_LIMIT) {
      setIsLimited(true)
      addMessage('bot', t('chatWidget.rateLimitMsg'))
      return
    }

    setMessage('')
    setHasError(false)
    addMessage('user', input)
    incrementMessageCount()
    const newCount = getMessageCount()
    setMsgCount(newCount)
    if (newCount >= RATE_LIMIT) setIsLimited(true)
    setIsLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const utm = getUtm()
      const res = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chatInput: input,
          sessionId: sessionIdRef.current || getSessionId(),
          language: LANG,
          systemPrompt: buildSystemPrompt(LANG),
          model: 'anthropic/claude-3-5-haiku',
          max_tokens: 400,
          temperature: 0.3,
          metadata: {
            organization_slug: ORGANIZATION_SLUG,
            channel: 'chatbot',
            pageUrl: window.location.href,
            utm_source: utm.utm_source || '',
            utm_campaign: utm.utm_campaign || '',
            timestamp: new Date().toISOString()
          }
        })
      })

      clearTimeout(timeout)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const respuesta = data.respuesta_prompt || data.respuesta || data.response || ''

      if (data.create_lead === true || data.datos_suficientes_para_crm === true) {
        addMessage('bot', respuesta || t('chatWidget.leadConfirmedMsg'))
        setLeadDone(true)
        try {
          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(SESSION_KEY)
        } catch { /* ignore */ }
      } else {
        addMessage('bot', respuesta || t('chatWidget.errorMsg'))
      }
    } catch (err) {
      clearTimeout(timeout)
      setHasError(true)
      addMessage('bot', err.name === 'AbortError' ? t('chatWidget.timeoutMsg') : t('chatWidget.errorMsg'))
    } finally {
      setIsLoading(false)
    }
  }

  // Clears the rate limit, the session and the conversation (dev helper)
  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    } catch { /* ignore */ }
    sessionIdRef.current = getSessionId()
    setMessages([{ type: 'bot', text: t('chatWidget.greeting'), time: nowTime() }])
    setMessage('')
    setMsgCount(0)
    setIsLimited(false)
    setHasError(false)
    setLeadDone(false)
    setIsLoading(false)
  }

  const handleRetry = () => {
    setHasError(false)
    const last = messages.filter((m) => m.type === 'user').at(-1)
    if (last) handleSend(last.text)
  }

  return (
    <>
      {/* Sticky CTA Chip */}
      {showStickyCTA && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-white text-navy-900 text-sm font-medium rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 lg:bottom-6"
        >
          {t('cta.getInstantQuote')}
          <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-navy-900 hover:bg-navy-800 transition-all duration-300"
          aria-label={t('chatWidget.openChat')}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-sm lg:max-w-[30rem] h-[min(32rem,var(--chat-vh))] lg:h-[min(44rem,var(--chat-vh))] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up"
          style={{ '--chat-vh': `${viewportH - 48}px` }}
        >
          {/* Header */}
          <div className="bg-navy-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">{t('chatWidget.assistantName')}</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/80 text-xs">{t('chatWidget.onlineStatus')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {import.meta.env.DEV && (
                <button
                  onClick={handleReset}
                  className="text-[10px] text-white/50 hover:text-red-400 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={t('chatWidget.closeChat')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Rate bar */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-[3px]">
              {Array.from({ length: RATE_LIMIT }, (_, i) => (
                <div
                  key={i}
                  className={`w-[7px] h-[7px] rounded-full transition-colors duration-300 ${i < msgCount ? 'bg-gray-300' : 'bg-brand-blue'}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 ml-auto whitespace-nowrap">
              {leadDone
                ? t('chatWidget.requestRegistered')
                : isLimited
                  ? t('chatWidget.limitReached')
                  : t('chatWidget.messagesLeft', { count: remaining })}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <span className={`text-xs mt-1 block ${msg.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Retry */}
            {hasError && !isLoading && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-xs text-brand-blue border border-brand-blue px-3 py-2 rounded-full hover:bg-brand-blue hover:text-white transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('chatWidget.retry')}
                </button>
              </div>
            )}

            {/* Lead confirmed */}
            {leadDone && (
              <div className="flex justify-center mb-4">
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-2 rounded-full">
                  {t('chatWidget.leadDoneBadge')}
                </div>
              </div>
            )}

            {/* Limit reached / lead done */}
            {(isLimited || leadDone) && (
              <div className="text-center text-xs text-gray-500 px-3 py-2 bg-gray-100 rounded-lg mx-2">
                {leadDone ? t('chatWidget.needMoreHelp') : t('chatWidget.rateLimitBanner')}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {!leadDone && !isLimited && (
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 text-center">{t('chatWidget.quickRepliesLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {quickReplyIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleSend(t(`chatWidget.messages.${id}`))}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-white border border-brand-blue text-brand-blue text-xs rounded-full hover:bg-brand-blue hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t(`chatWidget.quickReplies.${id}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          {!leadDone && !isLimited && (
            <div className="px-4 pt-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatWidget.inputPlaceholder')}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !message.trim()}
                  className="w-10 h-10 bg-whatsapp hover:bg-whatsapp-light text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp fallback */}
          <div className="p-4 bg-white">
            <button
              onClick={() => openWhatsApp(t('chatWidget.messages.contactedViaChat'))}
              className="w-full py-2.5 bg-whatsapp hover:bg-whatsapp-light text-white text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t('chatWidget.continueOnWhatsApp')}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">{t('chatWidget.poweredBy')}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
