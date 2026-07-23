import projectsContent from '../locales/en/projects.json'

const projectImages = {
  1: '/assets/img/projects/bathroom-refit.webp',
  2: '/assets/img/projects/kitchen-renovation.webp',
  3: '/assets/img/projects/modern-bathroom.webp',
  4: '/assets/img/projects/interior-painting.webp',
  5: '/assets/img/projects/property-refurb.webp',
  6: '/assets/img/projects/lounge-makeover.webp'
}

export const projects = Object.entries(projectsContent.items).map(([id, content]) => ({
  id: Number(id),
  image: projectImages[id],
  ...content
}))

export default projects
