import { Card, Rank, Suit, SUITS } from './types';

/** One standard deck: 8 ranks × 4 suits = 32 unique cards. */
export function createDeck(): Card[] {
  const ranks: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  return ranks.flatMap((rank) =>
    SUITS.map((suit) => ({
      id: `${rank}-${suit}`,
      rank,
      suit,
    })),
  );
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function rankLabel(rank: Rank): string {
  return rank;
}

export function suitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
  }
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function rankHint(rank: Rank): string | null {
  switch (rank) {
    case '7':
      return '7-chain';
    case 'Q':
      return 'Wild';
    case 'A':
      return 'Skip';
    default:
      return null;
  }
}
