import {
  onDocumentReady,
} from './utils';
import WebSocketManager from './WebSocketManager';

const ws = new WebSocketManager();

/**
 * Prepare the extension code and run
 */
function init() {
  document.addEventListener('ccSmartChessBoard-draw', () => {
    console.log('On move');
  });
}

onDocumentReady(() => {
  setTimeout(init, 500);
});
