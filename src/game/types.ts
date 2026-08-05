export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export type Card = {
  id: string;
  rank: Rank;
  suit: Suit;
  /** Queen-only: suit called for matching; card keeps its printed suit. */
  calledSuit?: Suit;
};

export type Player = {
  id: string;
  name: string;
  hand: Card[];
  isHuman: boolean;
  declared: boolean;
};

export type GamePhase = 'playing' | 'roundOver' | 'matchOver';

export type PendingPrompt = { type: 'suitChoice'; playerIndex: number; cardIds: string[] };

export type LastPlay = {
  playerIndex: number;
  cards: Card[];
};

export type LastDraw = {
  playerIndex: number;
  cards: Card[];
  postDrawPlay?: boolean;
  message?: GameMessage;
};

export type PendingRoundFinish = {
  winnerId: string;
  winningCards: Card[];
};

export type GameMessage = {
  key: string;
  params?: Record<string, string | number | boolean>;
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  phase: GamePhase;
  roundWinnerId: string | null;
  matchWinnerId: string | null;
  scores: Record<string, number>;
  roundNumber: number;
  lastRoundScores: Record<string, number> | null;
  sevenChainTotal: number;
  aceSkipsRemaining: number;
  postDrawPlay: boolean;
  pendingPrompt: PendingPrompt | null;
  lastPlay: LastPlay | null;
  lastDraw: LastDraw | null;
  pendingRoundFinish: PendingRoundFinish | null;
  message: GameMessage;
};

export type SeatPosition = 'bottom' | 'top' | 'left' | 'right';

/** Seat layout clockwise from bottom: You → left → top → right */
export const PLAYER_SEATS: SeatPosition[] = ['bottom', 'left', 'top', 'right'];
