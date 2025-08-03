import { Hono } from 'hono';

const app = new Hono();

app.use('*', async (c, next) => await next())

export default app