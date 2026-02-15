import http from 'http';
import next from 'next';
import { parse } from 'url';
import { createSocketServer } from './lib/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true);
    handle(req, res, parsedUrl);
  });

  createSocketServer(server);

  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => {
    console.log(`[ws] Server ready on http://localhost:${port}`);
  });
});
