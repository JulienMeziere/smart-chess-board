import ChessComController, { ChessComControllerProps } from "./ChessComController";

export default function init(props: ChessComControllerProps) {
  const chessController = ChessComController.getInstance(props);
  chessController.launchGame();
}
