import { Card, Rank, Suit } from './types';

export function getActiveSuit(card: Card): Suit {
  return card.calledSuit ?? card.suit;
}

export function getTopCard(discardPile: Card[]): Card | null {
  return discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
}

export function canMatchTop(card: Card, topCard: Card): boolean {
  if (card.rank === 'Q') {
    return true;
  }
  return card.rank === topCard.rank || card.suit === getActiveSuit(topCard);
}

export function isSameRankStack(cards: Card[]): boolean {
  if (cards.length === 0) {
    return false;
  }
  return cards.every((card) => card.rank === cards[0].rank);
}

export function canPlayStack(cards: Card[], topCard: Card | null): boolean {
  if (cards.length === 0 || !isSameRankStack(cards)) {
    return false;
  }
  if (!topCard || cards[0].rank === 'Q') {
    return true;
  }
  return canMatchTop(cards[0], topCard);
}

export function getPlayableStacks(hand: Card[], topCard: Card | null): Card[][] {
  if (hand.length === 0) {
    return [];
  }

  const byRank = new Map<Rank, Card[]>();
  for (const card of hand) {
    const group = byRank.get(card.rank) ?? [];
    group.push(card);
    byRank.set(card.rank, group);
  }

  const stacks: Card[][] = [];
  for (const group of byRank.values()) {
    const isWildQueen = group[0].rank === 'Q';
    if (!topCard || isWildQueen || canMatchTop(group[0], topCard)) {
      for (let size = 1; size <= group.length; size += 1) {
        stacks.push(group.slice(0, size));
      }
    }
  }

  return stacks;
}

export function hasPlayableCard(hand: Card[], topCard: Card | null): boolean {
  return getPlayableStacks(hand, topCard).length > 0;
}

/** One card left, or multiple cards that are all the same rank. */
export function isOneCardLeft(hand: Card[]): boolean {
  if (hand.length === 0) {
    return false;
  }
  if (hand.length === 1) {
    return true;
  }
  const rank = hand[0].rank;
  return hand.every((card) => card.rank === rank);
}

export function needsDeclaration(hand: Card[]): boolean {
  return isOneCardLeft(hand);
}

export function rankSortValue(rank: Rank): number {
  const order: Record<Rank, number> = {
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return order[rank];
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const rankDelta = rankSortValue(a.rank) - rankSortValue(b.rank);
    if (rankDelta !== 0) {
      return rankDelta;
    }
    return a.suit.localeCompare(b.suit);
  });
}

export function requiresSuitChoice(rank: Rank): rank is 'Q' {
  return rank === 'Q';
}
