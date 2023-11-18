import { MoveReturnType, IMoveDetails } from './types';

export type WebSocketMessageType = {
  type: 'ROLE';
  data: 'chrome headless';
} | {
  type: 'MOVE_STATUS';
  data: MoveReturnType;
} | {
  type: 'OPPONENT_MOVE';
  data: IMoveDetails;
};
