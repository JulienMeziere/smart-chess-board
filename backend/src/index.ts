import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import WebSocketManager, { RawData, MessageEvent } from 'ws';
import readline from 'readline';

/* Chrome Headless */
let chromeHeadless: WebSocketManager;

function onChromeHeadlessMessage({ data }: MessageEvent) {
  console.log(`[Chrome] received: ${data.toString()}`);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketManager.Server({ noServer: true });
const port = 3000;

app.use(cors());

app.get('/test', (_: Request, res: Response) => {
  console.log('Je recois une requete');
  res.status(200).send('Hello world!');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws: WebSocketManager) => {
  console.log('WebSocket connection established');

  ws.on('message', (data: RawData) => {
    const message = data.toString();
    if (message === '{ role: "chrome headless" }' && (chromeHeadless === undefined || chromeHeadless.readyState === WebSocketManager.CLOSED)) {
      console.log('Chrome Headless connected');
      chromeHeadless = ws;
      chromeHeadless.addEventListener('message', onChromeHeadlessMessage);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (input) => {
  wss.clients.forEach((client) => {
    client.readyState === WebSocketManager.OPEN && client.send(input);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
