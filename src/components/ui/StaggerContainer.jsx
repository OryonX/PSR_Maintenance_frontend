import React from 'react'
import { useInView } from '../../hooks/useInView.js'

function StaggerContainer({ 
  children, 
  className = '', 
  staggerDelay = 80,
  duration = 500
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity ${duration}ms ease-out ${index * staggerDelay}ms, transform ${duration}ms ease-out ${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export default StaggerContainer