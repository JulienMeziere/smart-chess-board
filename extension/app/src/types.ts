export type Nullable<T> = T | null;

export type AnyFunction = (...args: any[]) => any;

export type GetPiecesSetupType = Record<string, { color: number, type: string, area: TArea }>;

export interface IChessboard {
  getElement: () => Element
  getRelativeContainer: () => Element
  makeMove: (fromSq: TArea, toSq: TArea, promotionPiece?: string) => void
  isLegalMove: (fromSq: TArea, toSq: TArea) => boolean
  isPlayersMove: () => boolean
  getPiecesSetup: () => GetPiecesSetupType;
  markArrow: (fromSq: TArea, toSq: TArea) => void
  unmarkArrow: (fromSq: TArea, toSq: TArea) => void
  clearMarkedArrows: () => void
  markArea: (square: TArea) => void
  unmarkArea: (square: TArea) => void
  clearMarkedAreas: () => void
  clearAllMarkings: () => void
  submitDailyMove: () => void
}

export type TArea = string;

export type TPiece = string;

export type TFromTo = [ TArea, TArea ];

export type TMoveType = string;

export interface IMoveTemplate {
  piece: TPiece
  from?: TArea
  to: TArea
  promotionPiece?: TPiece
}

export type IPotentialMoves = IMoveTemplate[];

export interface IMove extends IMoveTemplate {
  from: TArea
}

export interface IMoveDetails {
  piece: TPiece
  moveType: TMoveType
  from: TArea
  to: TArea
  promotionPiece?: TPiece
  check: boolean
  checkmate: boolean
}
