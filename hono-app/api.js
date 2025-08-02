// import { Hono } from 'hono'
const { Hono } = require('hono');

const api = new Hono();

// api.get('/', (c) => c.json({success: 'ok'}));

api.get('/getProps', (c) => c.json({
    name: 'routeName',
    server: true,
    msg: 'This is page ' + 'routeName'.toUpperCase(),
  }))

// export default api

// module.exports = { api };
module.exports = api;