import { Card, Rank } from './types';

export const RANK_POINTS: Record<Rank, number> = {
  '7': 0,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 2,
  Q: 30,
  K: 4,
  A: 11,
};

export function cardPoints(card: Card): number {
  return RANK_POINTS[card.rank];
}

export function handPoints(hand: Card[]): number {
  return hand.reduce((total, card) => total + cardPoints(card), 0);
}

export function applyRoundScore(current: number, roundScore: number): number {
  const next = current + roundScore;
  if (next === 108) {
    return 54;
  }
  return next;
}

export function isMatchOver(scores: Record<string, number>): boolean {
  return Object.values(scores).some((score) => score > 108);
}

export function getLowestScorePlayerId(scores: Record<string, number>, playerIds: string[]): string {
  return [...playerIds].sort((a, b) => scores[a] - scores[b])[0];
}
