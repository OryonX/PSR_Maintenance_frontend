import React from 'react'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import StaggerContainer from '../ui/StaggerContainer.jsx'
import ProjectCard from '../ui/ProjectCard.jsx'
import { projects } from '../../config/projects.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function Projects() {
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('home')

  return (
    <section id="work" className="bg-navy-900 section-padding">
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2 block">
            {t('projects.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            {t('projects.titlePrefix')}<span className="text-white/60">{t('projects.titleHighlight')}</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {t('projects.subtitle')}
          </p>
        </AnimatedSection>

        {/* Projects Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </StaggerContainer>

        {/* CTA */}
        <AnimatedSection delay={600} className="text-center mt-12">
          <button
            onClick={() => openWhatsApp(t('projects.whatsappMessage'))}
            className="btn-whatsapp group inline-flex"
          >
            {t('projects.cta')}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default Projects
