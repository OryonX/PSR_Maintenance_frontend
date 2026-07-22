// API Actions for PSR Maintenance Services

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const QUOTE_WEBHOOK_URL = import.meta.env.VITE_QUOTE_WEBHOOK_URL

/**
 * Submit a quote request to the webhook
 * @param {Object} formData - The quote form data
 * @returns {Promise<Object>} - The response from the server
 */
export async function submitQuoteRequest(formData) {
  if (!QUOTE_WEBHOOK_URL) {
    console.warn('VITE_QUOTE_WEBHOOK_URL not configured')
    // Simulate success for development
    return { success: true, message: 'Quote request received (dev mode)' }
  }

  try {
    const response = await fetch(QUOTE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'website_quote_form',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting quote request:', error)
    throw error
  }
}

/**
 * Track a page view (for analytics)
 * @param {string} page - The page path
 */
export function trackPageView(page) {
  // Implement analytics tracking here
  // Example: Google Analytics, Plausible, etc.
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_TRACKING_ID', {
      page_path: page,
    })
  }
}

export default {
  submitQuoteRequest,
  trackPageView,
}