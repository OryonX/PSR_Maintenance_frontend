import projectsContent from '../locales/en/projects.json'

const projectImages = {
  1: '/assets/img/projects/bathroom-refit.jpg',
  2: '/assets/img/projects/kitchen-renovation.jpg',
  3: '/assets/img/projects/modern-bathroom.jpg',
  4: '/assets/img/projects/interior-painting.jpg',
  5: '/assets/img/projects/property-refurb.jpg',
  6: '/assets/img/projects/lounge-makeover.jpg'
}

export const projects = Object.entries(projectsContent.items).map(([id, content]) => ({
  id: Number(id),
  image: projectImages[id],
  ...content
}))

export default projects
