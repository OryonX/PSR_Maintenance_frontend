import React from 'react'
import { useInView } from '../../hooks/useInView.js'

function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 600
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)'
      case 'down': return 'translateY(-20px)'
      case 'left': return 'translateX(20px)'
      case 'right': return 'translateX(-20px)'
      default: return 'translateY(20px)'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translate(0)' : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

export default AnimatedSection