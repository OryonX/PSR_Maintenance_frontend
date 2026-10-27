// The CRM is authenticated (localStorage token) and has parameterized routes
// (/admin/leads/[id], etc.) that Vike can't statically prerender without a
// discovery hook — this subtree opts out of the root's global prerender:true.
//
// It renders client-side only (ssr:false) with client routing, and Netlify
// serves the prerendered /admin/login shell as the SPA fallback for /admin/*.
export default {
  prerender: false,
  ssr: false,
  clientRouting: true
}
