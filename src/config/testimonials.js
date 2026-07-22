// NOTE: These are placeholder testimonials for demonstration.
// In production, replace with real reviews from Google Business Profile or actual customer feedback.

import testimonialsContent from '../locales/en/testimonials.json'

const testimonialMeta = {
  1: { rating: 5, verified: true },
  2: { rating: 5, verified: true },
  3: { rating: 5, verified: true },
  4: { rating: 5, verified: true }
}

export const testimonials = Object.entries(testimonialsContent.items).map(([id, content]) => ({
  id: Number(id),
  ...testimonialMeta[id],
  ...content
}))

export const aggregateRating = {
  rating: 4.9,
  totalReviews: 120,
  googleBusinessUrl: 'https://g.page/psrmaintenance'
}

export default { testimonials, aggregateRating }
