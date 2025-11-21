export enum EditorMode {
  CODE = 'CODE',
  SPRITE = 'SPRITE',
  RUN = 'RUN',
}

export interface GameData {
  code: string;
  sprites: number[][]; // Array of 8x8 sprites (each is array of 64 color indices)
  activeSpriteIndex: number;
}

export interface APIConfig {
  apiKey: string;
}
