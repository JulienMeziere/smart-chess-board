import filter from 'lodash/filter';
import { squareToCoords } from './utils';
import { parseCommand } from './commands';
import {
  IChessboard,
  TArea,
  TPiece,
  IMoveTemplate,
  IPotentialMoves,
  IMove,
} from './types';

/**
 * Check if input is valid square name
 */
function validateSquareName(input: string) : boolean {
  return /^[a-h][1-8]$/.test(input);
}

/**
 * Extract all possible information from algebraic notation
 */
function parseAlgebraic(input: string): IPotentialMoves {
  // ignore UCI notation
  if (/^\s*[a-h][1-8][a-h][1-8][rqknb]?\s*$/.test(input)) {
    return [];
  }

  let moveString = input.replace(/[\s\-\(\)]+/g, '');
  const moves: IPotentialMoves = [];

  if (/[o0][o0][o0]/i.test(moveString)) {
    return [
      // white long castling
      {
        piece: 'k',
        from: 'e1',
        to: 'c1',
      },
      // black long castling
      {
        piece: 'k',
        from: 'e8',
        to: 'c8',
      }
    ];
  } else if (/[o0][o0]/i.test(moveString)) {
    return [
      // white short castling
      {
        piece: 'k',
        from: 'e1',
        to: 'g1',
      },
      // black short castling
      {
        piece: 'k',
        from: 'e8',
        to: 'g8',
      }
    ];
  }


  const pawnRegex = /^([a-h])?(x)?([a-h])([1-8])(e\.?p\.?)?(=[qrnbQRNB])?[+#]?$/;
  const pawnResult = moveString.match(pawnRegex);
  if (pawnResult) {
    const [
      _,
      fromFile,
      isCapture,
      toFile,
      toRank,
      enPassant,
      promotion,
    ] = pawnResult;

    if (fromFile === toFile) {
      // Do nothing
      // This disables moves like `bb4` for pawns to avoid ambiguity with bishops
    } else {
      const move: IMoveTemplate = {
        piece: 'p',
        from: <TArea>`${fromFile || '.'}.`,
        to: <TArea>`${toFile || '.'}${toRank || '.'}`,
      };

      if (promotion) {
        move.promotionPiece = <TPiece>promotion[1].toLowerCase();
      }

      moves.push(move);
    }
  }

  const pieceRegex = /^([RQKNBrqknb])([a-h])?([1-8])?(x)?([a-h])([1-8])?[+#]?$/;
  const pieceResult = moveString.match(pieceRegex);
  if (pieceResult) {
    const [
      _,
      pieceName,
      fromFile,
      fromVer,
      isCapture,
      toFile,
      toRank,
    ] = pieceResult;

    moves.push({
      piece: <TPiece>(pieceName).toLowerCase(),
      from: <TArea>`${fromFile || '.'}${fromVer || '.'}`,
      to: <TArea>`${toFile || '.'}${toRank || '.'}`,
    });
  }

  return moves;
}

/**
 * Parse simplest move format: 'e2e4'
 */
function parseUCI(input: string) : IPotentialMoves {
  const filteredSymbols = input.replace(/( |-)+/g, '');
  const fromSquare = <TArea>filteredSymbols.slice(0, 2);
  const toSquare = <TArea>filteredSymbols.slice(2, 4);
  const promotion = <TPiece>filteredSymbols.slice(4, 5);

  if (validateSquareName(fromSquare) && validateSquareName(toSquare)) {
    const result: IMoveTemplate = {
      piece: '.',
      from: fromSquare,
      to: toSquare,
    };

    if (promotion) {
      result.promotionPiece = promotion;
    }

    return [result];
  }

  return [];
}

/**
 * Parse message input by user
 */
function parseMoveInput(input: string): IPotentialMoves {
  return [
    ...parseUCI(input),
    ...parseAlgebraic(input),
  ];
}


/**
 * Exclude moves conflicting between each other for whatever reasons
 * (some exceptions)
 */
function excludeConflictingMoves(moves: IMove[]) : IMove[] {
  const piecesString = moves.map(m => m.piece).sort().join('');
  if (piecesString === 'bp') {
    // Bishop and pawn conflict
    // Pawn is preferred in this case
    // @see https://github.com/everyonesdesign/Chess-Helper/issues/51
    const pawnMove = moves.find(m => m.piece === 'p') as IMove;
    return [pawnMove];
  }

  return moves;
}

/**
 * Get exact from and to coords from move data
 */
export function getLegalMoves(board: IChessboard, potentialMoves: IPotentialMoves) : IMove[] {
  if (!board || !potentialMoves.length || !board.isPlayersMove()) {
    return [];
  }

  let legalMoves: IMove[] = [];
  potentialMoves.forEach((move) => {
    const toYCoord = squareToCoords(move.to)[1];

    const pieces = board.getPiecesSetup();

    const matchingPieces = filter(pieces, (p) => {
      // Treat promotion moves without "promotionPiece" as invalid
      if (
        p.type === 'p' &&
        [1, 8].includes(toYCoord) &&
        !move.promotionPiece
      ) {
        return false;
      }

      return (
        // RegExp is required, because move.piece/move.from aren't always there
        // It might be just ".", meaning "any piece" (imagine move like "e2e4")
        new RegExp(`^${move.piece}$`).test(p.type) &&
        new RegExp(`^${move.from}$`).test(p.area) &&
        board.isLegalMove(p.area, move.to)
      );
    });

    legalMoves = [
      ...legalMoves,
      ...matchingPieces.map((piece) => ({
        ...move,
        from: <TArea>piece.area,
      })),
    ];
  });

  return excludeConflictingMoves(legalMoves);
}

/**
 * Handle user input and act in appropriate way
 * The function uses active board on the screen if there's any
 */
export function go(board: IChessboard, input: string) : boolean {
  if (parseCommand(input)) return true;

  const parseResult = parseMoveInput(input);
  const moves = getLegalMoves(board, parseResult);
  if (moves.length === 1) {
    const move = moves[0];
    makeMove(board, move.from, move.to, move.promotionPiece);

    return true;
  } else if (moves.length > 1) {
    console.log('Ambiguous move', { move: input });
  } else {
    console.log('Incorrect move', { move: input });
  }

  return false;
}

/**
 * Check move and make it if it's legal
 * This function relies on chess.com chessboard interface
 */
export function makeMove(
  board: IChessboard,
  fromField: TArea,
  toField: TArea,
  promotionPiece?: TPiece,
) {
  if (board.isLegalMove(fromField, toField)) {
      board.makeMove(fromField, toField, promotionPiece);
      try {
        board.submitDailyMove();
      } catch(e) {
        console.log(e);
      }
  } else {
    const move = fromField + '-' + toField;
    console.log('Illegal move', { move });
  }
}
