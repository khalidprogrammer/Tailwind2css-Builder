
export enum BuilderType {
  ELEMENTOR = 'elementor',
  GENERIC = 'generic',
  BRICKS = 'bricks'
}

export enum OutputFormat {
  STANDARD = 'standard',
  BEM = 'bem',
  VANILLA = 'vanilla'
}

export enum OutputTheme {
  DEEP_SPACE = 'deep-space',
  MIDNIGHT = 'midnight',
  CYBERPUNK = 'cyberpunk'
}

export interface ConversionResult {
  css: string;
  explanation: string;
  notes: string[];
}

export interface AppState {
  inputCode: string;
  builder: BuilderType;
  format: OutputFormat;
  theme: OutputTheme;
  isConverting: boolean;
  result: ConversionResult | null;
  error: string | null;
  isCompact: boolean;
}
