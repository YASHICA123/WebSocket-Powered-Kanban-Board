import http from 'http';
import { createSocketServer } from '../lib/websocket-server';

const port = Number(process.env.PORT || 3001);

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

createSocketServer(server);

server.listen(port, () => {
  console.log(`[realtime] Socket.IO server listening on http://localhost:${port}`);
});
