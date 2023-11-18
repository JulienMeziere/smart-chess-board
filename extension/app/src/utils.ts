import { TArea } from './types';

// value is stored inside of chessboard.rightClickMarkColors
export const RED_SQUARE_COLOR = '#f42a32';

export function combineStringArrays(a: string[], b: string[]) : string[] {
  const combinations = [];

  for(var i = 0; i < a.length; i++) {
       for(var j = 0; j < b.length; j++) {
          combinations.push(`${a[i]}${b[j]}`)
       }
  }

  return combinations;
}

const ALL_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ALL_RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const ALL_AREAS: TArea[] = combineStringArrays(ALL_FILES, ALL_RANKS);

/**
 * Run callback on document ready
 * See https://stackoverflow.com/a/989970
 */
export function onDocumentReady(fn: () => void) : void {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/**
 * Translate square string to coords
 */
export function squareToCoords(square: TArea) : number[] {
  const ver = 'abcdefgh'.indexOf(square[0]) + 1;
  const hor = Number(square[1]);
  return [ver, hor];
}

/**
 * Translate coords string to square
 */
export function coordsToSquare(coords: string) : TArea {
  const numbers = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return numbers[Number(coords.slice(1, 2))] + coords.slice(3, 4);
}
