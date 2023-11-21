import express from 'express';
import cors from 'cors';
import http from 'http';
import WebSocketManager, { RawData, MessageEvent, Data } from 'ws';
import readline from 'readline';
import { WebSocketMessageType } from '../../extension/app/src/commonTypes';
import initChessComController from './ChessComController';

initChessComController({ headless: false, logBrowser: true, logBrowserFilter: 'ChessBoardController' });

function parseMessage(data: RawData | Data): WebSocketMessageType | null {
  try {
    return JSON.parse(data.toString());
  } catch (error) {
    console.error('Error while parsing message', error);
  }
  return null;
}

/* Chrome Headless */
let chromeHeadless: WebSocketManager;

function onChromeHeadlessMessage({ data }: MessageEvent) {
  const message = parseMessage(data);
  if (!message) return;

  switch (message.type) {
    case 'OPPONENT_MOVE':
      console.log('Opponent move:', message.data);
      break;
    case 'MOVE_STATUS':
      console.log('Move status:', message.data);
      break;
    default:
      console.warn('[Chrome headless message] Wrong message:', message);
      break;
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketManager.Server({ noServer: true });
const port = 3000;

app.use(cors());

// app.get('/test', (_: Request, res: Response) => {
//   console.log('Je recois une requete');
//   res.status(200).send('Hello world!');
// });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws: WebSocketManager) => {
  console.log('WebSocket connection established');

  ws.on('message', (data: RawData) => {
    const message = parseMessage(data);
    if (!message || (ws === chromeHeadless && chromeHeadless.readyState === WebSocketManager.OPEN)) {
      return;
    }

    switch (message.type) {
      case 'ROLE':
        if (message.data === 'chrome headless' && (!chromeHeadless || chromeHeadless.readyState !== WebSocketManager.OPEN)) {
          console.log('Chrome Headless connected');
          chromeHeadless = ws;
          chromeHeadless.addEventListener('message', onChromeHeadlessMessage);
        }
        break;
      default:
        console.warn('Wrong message:', message);
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
