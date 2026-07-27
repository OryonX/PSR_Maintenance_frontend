// The CRM is authenticated (localStorage token) and has parameterized routes
// (/admin/leads/[id], etc.) that Vike can't statically prerender without a
// discovery hook — this subtree opts out of the root's global prerender:true.
export default {
  prerender: false
}
