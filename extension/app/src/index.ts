import WebSocketManager from './WebSocketManager';

let webSocket: WebSocketManager;

function init() {
  webSocket = new WebSocketManager();
}

setTimeout(init, 500);
