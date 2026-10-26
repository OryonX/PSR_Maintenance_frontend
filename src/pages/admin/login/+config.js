// Login is the one /admin page we DO prerender: with ssr:false inherited from
// the parent, Vike emits an empty client-only shell at /admin/login/index.html.
// Netlify uses that shell as the fallback for every /admin/* URL (see
// netlify.toml), and clientRouting picks the right page at runtime.
export default {
  prerender: true
}
