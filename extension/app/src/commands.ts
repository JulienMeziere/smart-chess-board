import { Nullable } from './types';

export const commands : Record<string, () => void> = {
  resign: () => {
    const resignButton = <Nullable<HTMLButtonElement>>document.querySelector('.resign-button-component, button[aria-label="Resign"]');
    resignButton && resignButton.click();
  },
  draw: () => {
    const drawButton = <Nullable<HTMLButtonElement>>document.querySelector('.draw-button-component');
    drawButton && drawButton.click();
  },
};

export function parseCommand(input: string) {
  if (input[0] !== '/') return false;

  const command = commands[input.slice(1)];
  if (command) {
    command();
    return true;
  }

  return false;
}
