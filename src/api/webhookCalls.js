// Webhook calls for PSR Maintenance Services
// These are specific integrations with external services

const WEBHOOK_URLS = {
  quote: import.meta.env.VITE_QUOTE_WEBHOOK_URL,
  contact: import.meta.env.VITE_CONTACT_WEBHOOK_URL,
}

/**
 * Send data to a webhook endpoint
 * @param {string} endpoint - The webhook endpoint key
 * @param {Object} data - The data to send
 * @returns {Promise<Object>} - The response
 */
export async function sendToWebhook(endpoint, data) {
  const url = WEBHOOK_URLS[endpoint]
  
  if (!url) {
    console.warn(`Webhook URL for '${endpoint}' not configured`)
    return { success: false, error: 'Webhook not configured' }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        _timestamp: new Date().toISOString(),
        _source: 'psr_website',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return { success: true, data: await response.json() }
  } catch (error) {
    console.error(`Webhook error (${endpoint}):`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Send quote request to n8n webhook
 * @param {Object} quoteData - The quote form data
 */
export async function sendQuoteToN8N(quoteData) {
  return sendToWebhook('quote', quoteData)
}

/**
 * Send contact form submission to webhook
 * @param {Object} contactData - The contact form data
 */
export async function sendContactToN8N(contactData) {
  return sendToWebhook('contact', contactData)
}

export default {
  sendToWebhook,
  sendQuoteToN8N,
  sendContactToN8N,
}