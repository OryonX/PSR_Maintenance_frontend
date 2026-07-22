import React from 'react'
import { Star, BadgeCheck } from 'lucide-react'

function TestimonialCard({ testimonial }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header with rating and verified badge */}
      <div className="flex items-center justify-between mb-4">
        {/* Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        
        {/* Verified Badge */}
        {testimonial.verified && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BadgeCheck className="w-4 h-4 text-blue-500" />
            <span>Verified on Google</span>
          </div>
        )}
      </div>

      {/* Review Text */}
      <blockquote className="text-gray-700 text-sm leading-relaxed mb-5 flex-grow">
        "{testimonial.text}"
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="font-semibold text-navy-900 text-sm">{testimonial.name}</p>
          <p className="text-xs text-gray-500">{testimonial.location} · {testimonial.timeAgo}</p>
        </div>
        
        {/* Service Badge */}
        <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded">
          {testimonial.service}
        </span>
      </div>
    </article>
  )
}

export default TestimonialCard