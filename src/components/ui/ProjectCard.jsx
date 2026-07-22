import React from 'react'
import { MapPin } from 'lucide-react'

function ProjectCard({ project }) {
  return (
    <article className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ 
          backgroundImage: `url(${project.image})`,
          backgroundColor: '#1B2A4A' // Fallback color matching the navy
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
      
      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        {/* Category Badge */}
        <span className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          {project.category}
        </span>
        
        {/* Title */}
        <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-y-0 transition-transform duration-300">
          {project.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-white/70 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{project.location}</span>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard