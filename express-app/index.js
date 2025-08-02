const express = require('express')
const app = express()
const port = 8080

const api = require('./api')


// Serve every static asset route
for (const asset of ssr.assets || []) {
    app.use(
      '/' + asset,
      express.static(path.join(__dirname, `${dist}/client/` + asset))
    )
  }

// Custom API to get data for each page
// See src/main.js to see how this is called
api.forEach(({ route, handler, method = 'get' }) =>
  app[method](route, handler)
)

// Everything else is treated as a "rendering request"
app.get('*', async (request, response) => {
    const url =
      request.protocol + '://' + request.get('host') + request.originalUrl
  
    const { html, status, statusText, headers } = await renderPage(url, {
      manifest,
      preload: true,
      // Anything passed here will be available in the main hook
      request,
      response,
      // initialState: { ... } // <- This would also be available
    })
  
    response.type('html')
    response.writeHead(status || 200, statusText || headers, headers)
    response.end(html)
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
