import projectsContent from '../locales/en/projects.json'

const GALLERY_PATH = '/img/gallery'

// Album order on the page; photo files are named <album>-01.webp, <album>-02.webp...
const albumOrder = ['bathroom-after', 'bathroom-before']

export const albums = albumOrder.map((id) => {
  const { photos, ...content } = projectsContent.albums[id]
  return {
    id,
    ...content,
    photos: photos.map((alt, index) => {
      const filename = `${id}-${String(index + 1).padStart(2, '0')}.webp`
      return {
        alt,
        src: `${GALLERY_PATH}/${filename}`,
        thumb: `${GALLERY_PATH}/thumbs/${filename}`
      }
    })
  }
})

export default albums
