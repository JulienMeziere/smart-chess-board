import { go } from './chess';
import { getBoard } from './chessboard';

const MAX_NB_OF_RETRIES = 3;
const RETRY_TIMEOUT = 1000;

export class WebSocketManager {
  private numberOfRetries: number = 0;
  private socket: WebSocket;
  private url: string;

  constructor(url = 'ws://localhost:3000') {
    this.url = url;
    this.socket = new WebSocket(this.url);
    this.init();
    (window as any).WSManager = this;
  }

  private init(reset = false) {
    if (reset) {
      this.socket = new WebSocket(this.url);
    }
    this.socket.addEventListener('open', (event) => this.onOpen(event));
    this.socket.addEventListener('message', (event) => this.onMessage(event));
    this.socket.addEventListener('close', (event) => this.onClose(event));
    this.socket.addEventListener('error', (event) => this.onError(event));
  }

  private onOpen(_: WebSocketEventMap['open']) {
    console.log('[WSManager] Connected!');
    this.send('{ role: "chrome headless" }');
    this.numberOfRetries = 0;
  }

  private onMessage({ data }: WebSocketEventMap['message']) {
    if (typeof data !== 'string') return;

    const board = getBoard();
    board && go(board, data);
    console.log(`[WSManager] received: '${data}'`);
  }

  private onClose(_: WebSocketEventMap['close']) {
    console.log('[WSManager] Disconnected!');
    if (this.numberOfRetries < MAX_NB_OF_RETRIES) {
      setTimeout(() => {
        this.numberOfRetries += 1;
        console.log('[WSManager] Retrying...');
        this.init(true);
      }, RETRY_TIMEOUT);
    }
  }

  private onError(event: WebSocketEventMap['error']) {
    console.error('[WSManager] Error:', event);
  }

  send(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    console.log(`[WSManager] sending: '${message}'`);
    this.socket.send(message);
  }
}

export default WebSocketManager;
