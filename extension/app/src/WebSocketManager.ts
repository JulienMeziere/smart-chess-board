import { go } from './chess';
import { ComponentChessboard } from './chessboard';
import { IMoveDetails } from './types';
import { WebSocketMessageType } from './commonTypes';

const MAX_NB_OF_RETRIES = 3;
const RETRY_TIMEOUT = 1000;

export class WebSocketManager {
  private numberOfRetries: number = 0;
  private socket: WebSocket;
  private url: string;
  private board: ComponentChessboard | null = null;

  constructor(url = 'ws://localhost:3000') {
    this.url = url;
    this.socket = new WebSocket(this.url);
    this.init();

    this.board = ComponentChessboard.getBoard();
    if (!this.board) {
      console.warn('[WSManager] Board not found!');
      return;
    };
    this.board.registerMoveCallback('WebSocketManager', (move, isNowPlayersTurn) => this.onMove(move, isNowPlayersTurn));
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
    this.send({ type: 'ROLE', data: 'chrome headless' });
    this.numberOfRetries = 0;
  }

  private onMessage({ data }: WebSocketEventMap['message']) {
    if (typeof data !== 'string' || !this.board) return;

    const moveStatus = go(this.board, data);
    this.send({ type: 'MOVE_STATUS', data: moveStatus });
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

  send(message: WebSocketMessageType) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    console.log('[WSManager] sending:', message);
    this.socket.send(JSON.stringify(message));
  }

  private onMove(move: IMoveDetails, isNowPlayersTurn: boolean) {
    if (!isNowPlayersTurn) return;

    this.send({ type: 'OPPONENT_MOVE', data: move });
  }
}

export default WebSocketManager;
