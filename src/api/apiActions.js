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
 * PDF como objectURL (sin descargar) — para el visor <iframe> del panel.
 * Mismo contrato de errores que request(): err.status / err.data.
 */
export const apiGetPdfBlobUrl = async (token, path) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/pdf", Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || `Error ${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return URL.createObjectURL(await res.blob());
};

/**
 * Envío por WhatsApp vía workflow n8n (CERO cambios de backend): n8n recibe
 * { doc_type, doc_id, phone, name }, descarga el PDF con token de servicio y
 * lo envía por la Cloud API de Meta. Sin VITE_N8N_WHATSAPP_WEBHOOK configurada
 * lanza error controlado que el visor muestra como "not configured".
 */
export const apiSendWhatsAppDocument = async ({ doc_type, doc_id, phone, name }) => {
  const url = import.meta.env.VITE_N8N_WHATSAPP_WEBHOOK;
  if (!url) {
    const err = new Error("WhatsApp sending is not configured");
    err.status = 0;
    throw err;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ doc_type, doc_id, phone, name }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || `Error ${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return res.json().catch(() => ({ ok: true }));
};

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