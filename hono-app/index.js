// import { Hono } from 'hono'
const { Hono } = require('hono');
// import api from './api';
const api = require('./api')
// import { serve } from '@hono/node-server'
const { serve } = require('@hono/node-server');
// const { serveStatic } = require('@hono/node-server/serve-static');

const app = new Hono()

// Serve every static asset route
// for (const asset of ssr.assets || []) {
//   app.use(
//     '/' + asset,
//     serveStatic({ root: path.join(__dirname, `${dist}/client/` + asset) })
//   )
// }

app.get('/', (c) => {
  return c.json({message: 'ok'})
})

app.route('/api', api);

// Everything else is treated as a "rendering request"
// app.get('*', async (c) => {
//   return c.html('<h1>ok</h1>');
// })

serve(app, (info) => {
  console.log(`Listening on: http://localhost:${info.port}`);
})