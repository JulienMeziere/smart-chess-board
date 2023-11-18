import { ComponentChessboard } from './chessboard';
import {
  onDocumentReady,
} from './utils';
import WebSocketManager from './WebSocketManager';

let webSocket: WebSocketManager;

function init() {
  webSocket = new WebSocketManager();
}

onDocumentReady(() => {
  setTimeout(init, 500);
});
