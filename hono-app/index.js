/* ---------------------------  dependencies  ------------------------------ */
const { Hono }           = require('hono')
const { serve }          = require('@hono/node-server')
const { serveStatic }    = require('hono/serve-static')
const path               = require('path')
const apiList            = require('./api')

/* ----------  vite-ssr bundle (prod) or dev-server (dev)  ------------------ */
const isProd   = process.env.NODE_ENV === 'production'
let   ssr
let   manifest
let   renderPage             // function (url, opts) → { html, status, … }

if (isProd) {
  // The file emitted by “vite build --ssr”.  Adjust the path if different.
  // const bundle = require('./dist/server/entry.cjs')
  const bundle = require('./dist/server/main.js')
  ssr         = bundle.ssr
  manifest    = bundle.manifest
  renderPage  = bundle.renderPage
} else {
  // DEV mode: spin up Vite in middleware mode so we can call its entry.
  // vite.config.js must contain viteSsr() plugin.
  const { createServer } = require('vite')
  ;(async () => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })

    // In dev mode vite-ssr’s virtual module is imported using Vite’s SSR API.
    const entry   = await vite.ssrLoadModule('/src/main.js')
    ssr           = entry.ssr
    manifest      = {}                 // not used in dev
    renderPage    = entry.renderPage

    app.use(vite.middlewares)          // let Vite handle HMR & assets
  })()
}

/* ------------------------------  config  ----------------------------------*/
const port   = process.env.PORT || 8080
const dist   = 'dist'            // folder produced by vite build --client

/* -----------------------------  Hono app  ---------------------------------*/
const app = new Hono()

/* 1) Static assets (production only; dev is delegated to Vite) ------------- */
if (isProd && ssr && ssr.assets) {
  ssr.assets.forEach((asset) => {
    // Matches “/vendor/…”, “/assets/…”, etc.
    app.use(
      `/${asset}/*`,
      serveStatic({
        root: path.join(__dirname, `${dist}/client`),
        rewriteRequestPath: (reqPath) => reqPath,
      })
    )
  })
}

/* 2) Mount your existing API routes --------------------------------------- */
apiList.forEach(({ route, handler, method = 'get' }) => {
  app[method](route, (c) => {
    // reuse the Node req/res expected by the old handler
    return new Promise((resolve) => {
      const res = c.res
      // resolve when Express-style handler finishes
      res.on('finish', resolve)
      handler(c.req.raw, res)
    })
  })
})

/* 3) Catch-all → vite-ssr renderPage -------------------------------------- */
app.get('*', async (c) => {
  if (!renderPage) {
    // When vite dev server is still booting
    return c.text('Starting up…', 503)
  }

  const nodeReq = c.req.raw
  const proto   =
    nodeReq.headers['x-forwarded-proto'] || c.req.url.startsWith('https') ? 'https' : 'http'
  const fullUrl = `${proto}://${nodeReq.headers.host}${c.req.url}`

  const { html, status = 200, statusText, headers = {} } = await renderPage(
    fullUrl,
    {
      manifest,
      preload : true,
      request : nodeReq,
      response: c,        // made available to main hook, same as Express
    }
  )

  // copy headers set by renderPage
  for (const [k, v] of Object.entries(headers)) c.header(k, v)
  if (statusText) c.header('Status-Text', statusText) // optional helper

  return c.html(html, status)
})

/* 4) Start --------------------------------------------------------------- */
serve(
  { fetch: app.fetch, port },
  () => console.log(`⚡  Hono server listening → http://localhost:${port}`)
)