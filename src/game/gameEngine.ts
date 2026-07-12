import { createDeck, shuffle } from './cards';
import {
  canPlayStack,
  getPlayableStacks,
  getTopCard,
  hasPlayableCard,
  isOneCardLeft,
  needsDeclaration,
  requiresSuitChoice,
  sortHand,
} from './rules';
import {
  applyRoundScore,
  getLowestScorePlayerId,
  handPoints,
  isMatchOver,
} from './scoring';
import { Card, GameState, PendingPrompt, Player, Rank, Suit } from './types';

const STARTING_HAND_SIZE = 5;
const PLAYER_NAMES = ['You', 'Sam', 'Alex', 'Jordan'];

function createPlayers(): Player[] {
  return PLAYER_NAMES.map((name, index) => ({
    id: `player-${index}`,
    name,
    hand: [],
    isHuman: index === 0,
    declared: false,
  }));
}

function emptyScores(players: Player[]): Record<string, number> {
  return Object.fromEntries(players.map((player) => [player.id, 0]));
}

function reshuffleDrawPile(state: GameState): GameState {
  if (state.drawPile.length > 0 || state.discardPile.length <= 1) {
    return state;
  }
  const top = state.discardPile[state.discardPile.length - 1];
  const rest = shuffle(state.discardPile.slice(0, -1));
  return {
    ...state,
    drawPile: rest,
    discardPile: [top],
    message: 'Draw pile reshuffled.',
  };
}

function drawCards(state: GameState, playerIndex: number, count: number): GameState {
  let next = reshuffleDrawPile(state);
  const drawn: Card[] = [];

  while (drawn.length < count) {
    if (next.drawPile.length === 0) {
      next = reshuffleDrawPile(next);
      if (next.drawPile.length === 0) {
        break;
      }
    }
    const drawPile = [...next.drawPile];
    drawn.push(drawPile.pop()!);
    next = { ...next, drawPile };
  }

  const players = next.players.map((player, index) => {
    if (index !== playerIndex) {
      return player;
    }
    return {
      ...player,
      hand: sortHand([...player.hand, ...drawn]),
      declared: false,
    };
  });

  return { ...next, players };
}

function nextPlayerIndex(state: GameState, steps = 1): number {
  const total = state.players.length;
  return (state.currentPlayerIndex + state.direction * steps + total * 32) % total;
}

function withCurrentPlayer(state: GameState, playerIndex: number): GameState {
  return { ...state, currentPlayerIndex: playerIndex };
}

function resetDeclaredIfNeeded(player: Player, hand: Card[]): Player {
  if (!isOneCardLeft(hand)) {
    return { ...player, declared: false };
  }
  return player;
}

function applyDeclarePenalty(state: GameState, playerIndex: number, reason: string): GameState {
  const player = state.players[playerIndex];
  let next = drawCards(state, playerIndex, 1);
  next = {
    ...next,
    message: `${player.name} forgot to declare and draws 1. ${reason}`,
    pendingPrompt: null,
  };
  return next;
}

function finishRound(
  state: GameState,
  winnerId: string,
  winningCards: Card[],
): GameState {
  const roundScores: Record<string, number> = {};
  const queenCount = winningCards.filter((card) => card.rank === 'Q').length;

  for (const player of state.players) {
    if (player.id === winnerId) {
      roundScores[player.id] = -(30 * queenCount);
    } else {
      roundScores[player.id] = handPoints(player.hand);
    }
  }

  const scores = { ...state.scores };
  for (const player of state.players) {
    scores[player.id] = applyRoundScore(scores[player.id], roundScores[player.id]);
  }

  const winner = state.players.find((player) => player.id === winnerId)!;
  let message = `${winner.name} wins round ${state.roundNumber}!`;
  if (queenCount > 0) {
    message += ` Queen bonus: -${30 * queenCount} points.`;
  }

  if (isMatchOver(scores)) {
    const matchWinnerId = getLowestScorePlayerId(
      scores,
      state.players.map((player) => player.id),
    );
    const matchWinner = state.players.find((player) => player.id === matchWinnerId)!;
    return {
      ...state,
      scores,
      phase: 'matchOver',
      roundWinnerId: winnerId,
      matchWinnerId,
      lastRoundScores: roundScores,
      sevenChainTotal: 0,
      aceChainTotal: 0,
      postDrawPlay: false,
      pendingPrompt: null,
      message: `${message} ${matchWinner.name} wins the match!`,
    };
  }

  return {
    ...state,
    scores,
    phase: 'roundOver',
    roundWinnerId: winnerId,
    lastRoundScores: roundScores,
    sevenChainTotal: 0,
    aceChainTotal: 0,
    postDrawPlay: false,
    pendingPrompt: null,
    message,
  };
}

export function clearLastPlay(state: GameState): GameState {
  return { ...state, lastPlay: null };
}

export function shouldContinueAutomation(state: GameState): boolean {
  if (state.phase !== 'playing' || state.lastPlay || state.pendingPrompt) {
    return false;
  }
  return !state.players[state.currentPlayerIndex].isHuman;
}

function resolveAceSkip(state: GameState): GameState {
  if (state.aceChainTotal <= 0) {
    return state;
  }
  const skip = state.aceChainTotal;
  const nextIndex = nextPlayerIndex(state, skip + 1);
  return {
    ...withCurrentPlayer(state, nextIndex),
    aceChainTotal: 0,
    message: `${skip} player${skip === 1 ? '' : 's'} skipped!`,
  };
}

function finalizePlay(
  state: GameState,
  playerIndex: number,
  playedCards: Card[],
  chosenSuit?: Suit,
): GameState {
  const player = state.players[playerIndex];
  const playedIds = new Set(playedCards.map((card) => card.id));
  let cardsToDiscard = playedCards;

  if (requiresSuitChoice(playedCards[0].rank)) {
    if (!chosenSuit) {
      return {
        ...state,
        pendingPrompt: {
          type: 'suitChoice',
          playerIndex,
          cardIds: playedCards.map((card) => card.id),
        },
        message: `${player.name} must choose a suit for Queen.`,
      };
    }
    cardsToDiscard = playedCards.map((card) => ({ ...card, calledSuit: chosenSuit }));
  }

  const remainingHand = player.hand.filter((card) => !playedIds.has(card.id));

  const players = state.players.map((p, index) => {
    if (index !== playerIndex) {
      return p;
    }
    return resetDeclaredIfNeeded({ ...p, hand: remainingHand }, remainingHand);
  });

  let next: GameState = {
    ...state,
    players,
    discardPile: [...state.discardPile, ...cardsToDiscard],
    pendingPrompt: null,
    postDrawPlay: false,
    lastPlay: { playerIndex, cards: cardsToDiscard },
    message: `${player.name} played ${playedCards.length} ${playedCards[0].rank}(s).`,
  };

  if (remainingHand.length === 0) {
    if (needsDeclaration(player.hand) && !player.declared) {
      const penalized = applyDeclarePenalty(next, playerIndex, 'Cannot go out without declaring.');
      return withCurrentPlayer(penalized, playerIndex);
    }
    return finishRound(next, player.id, cardsToDiscard);
  }

  if (needsDeclaration(remainingHand) && !players[playerIndex].declared && !players[playerIndex].isHuman) {
    const declaredPlayers = next.players.map((p, index) =>
      index === playerIndex ? { ...p, declared: true } : p,
    );
    next = { ...next, players: declaredPlayers, message: `${player.name} declares one card left.` };
  }

  const rank = playedCards[0].rank;
  const count = playedCards.length;

  if (rank === '7') {
    const sevenChainTotal = next.sevenChainTotal + count;
    const nextIndex = nextPlayerIndex(next, 1);
    return withDeclareReminder(
      {
        ...withCurrentPlayer(next, nextIndex),
        sevenChainTotal,
        message: `${player.name} played ${count} seven(s). Chain total: ${sevenChainTotal}.`,
      },
      playerIndex,
    );
  }

  if (rank === 'A') {
    const aceTotal = next.aceChainTotal + count;
    next = {
      ...next,
      aceChainTotal: aceTotal,
      message: `${player.name} played ${count} ace(s). Ace chain: ${aceTotal}.`,
    };
    const nextIndex = nextPlayerIndex(next, 1);
    return withDeclareReminder(withCurrentPlayer(next, nextIndex), playerIndex);
  }

  if (next.aceChainTotal > 0) {
    next = resolveAceSkip(next);
  }

  if (next.sevenChainTotal > 0) {
    next = { ...next, sevenChainTotal: 0 };
  }

  const nextIndex = nextPlayerIndex(next, 1);
  return withDeclareReminder(withCurrentPlayer(next, nextIndex), playerIndex);
}

function playCards(
  state: GameState,
  playerIndex: number,
  cardIds: string[],
  chosenSuit?: Suit,
): GameState {
  if (state.phase !== 'playing') {
    return state;
  }
  if (state.currentPlayerIndex !== playerIndex) {
    return state;
  }

  const player = state.players[playerIndex];
  const cards = cardIds
    .map((id) => player.hand.find((card) => card.id === id))
    .filter((card): card is Card => Boolean(card));

  if (cards.length !== cardIds.length) {
    return state;
  }

  const topCard = getTopCard(state.discardPile);
  const rank = cards[0].rank;

  if (state.sevenChainTotal > 0) {
    if (rank !== '7' || !canPlayStack(cards, topCard)) {
      return { ...state, message: 'You must play 7s or draw the penalty.' };
    }
  } else if (!canPlayStack(cards, topCard)) {
    return { ...state, message: 'Those cards cannot be played.' };
  }

  return finalizePlay(state, playerIndex, cards, chosenSuit);
}

function endTurn(state: GameState): GameState {
  const endingPlayer = state.players[state.currentPlayerIndex];
  let next: GameState = { ...state, postDrawPlay: false };

  if (next.aceChainTotal > 0) {
    next = resolveAceSkip(next);
  } else {
    next = withCurrentPlayer(next, nextPlayerIndex(next, 1));
  }

  if (
    endingPlayer.isHuman &&
    needsDeclaration(endingPlayer.hand) &&
    !endingPlayer.declared
  ) {
    next = { ...next, message: 'Declare before your next turn!' };
  }

  return next;
}

function beginHumanTurn(state: GameState): GameState {
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (state.currentPlayerIndex !== humanIndex) {
    return state;
  }

  const human = state.players[humanIndex];
  if (needsDeclaration(human.hand) && !human.declared) {
    return applyDeclarePenalty(state, humanIndex, 'Forgot to declare before your turn.');
  }

  return { ...state, message: 'Your turn' };
}

function withDeclareReminder(state: GameState, playedByIndex: number): GameState {
  const player = state.players[playedByIndex];
  if (player.isHuman && needsDeclaration(player.hand) && !player.declared) {
    return { ...state, message: 'Declare before your next turn!' };
  }
  return state;
}

function drawSevenPenalty(state: GameState, playerIndex: number): GameState {
  const drawCount = 7 * state.sevenChainTotal;
  const player = state.players[playerIndex];
  let next = drawCards(state, playerIndex, drawCount);
  next = {
    ...next,
    sevenChainTotal: 0,
    postDrawPlay: true,
    message: `${player.name} draws ${drawCount}. You may play cards or pass.`,
  };

  return withCurrentPlayer(next, playerIndex);
}

function mustDraw(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  const topCard = getTopCard(state.discardPile);

  if (state.sevenChainTotal > 0) {
    return drawSevenPenalty(state, playerIndex);
  }

  if (!hasPlayableCard(player.hand, topCard)) {
    let next = drawCards(state, playerIndex, 1);
    next = {
      ...next,
      message: `${player.name} draws 1. You may play a card or pass.`,
    };

    if (next.aceChainTotal > 0) {
      next = resolveAceSkip(next);
      return next;
    }

    return {
      ...withCurrentPlayer(next, playerIndex),
      postDrawPlay: true,
    };
  }

  return { ...state, message: 'You still have a playable card.' };
}

function findFirstDiscard(deck: Card[]): { top: Card; rest: Card[] } {
  const index = deck.findIndex((card) => card.rank !== 'A' && card.rank !== '7');
  const safeIndex = index === -1 ? deck.length - 1 : index;
  const top = deck[safeIndex];
  const rest = deck.filter((_, i) => i !== safeIndex);
  return { top, rest };
}

function dealRound(state: GameState): GameState {
  const shuffled = shuffle(createDeck());
  const { top, rest } = findFirstDiscard(shuffled);
  let drawPile = rest;

  const players = state.players.map((player) => {
    const hand = drawPile.splice(0, STARTING_HAND_SIZE);
    return { ...player, hand: sortHand(hand), declared: false };
  });

  return {
    ...state,
    players,
    drawPile,
    discardPile: [top],
    currentPlayerIndex: 0,
    direction: 1,
    phase: 'playing',
    roundWinnerId: null,
    sevenChainTotal: 0,
    aceChainTotal: 0,
    postDrawPlay: false,
    pendingPrompt: null,
    lastPlay: null,
    message: 'New round! Match rank or suit. Stack same-rank cards.',
  };
}

export function createInitialMatch(): GameState {
  const players = createPlayers();
  const base: GameState = {
    players,
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [],
    phase: 'playing',
    roundWinnerId: null,
    matchWinnerId: null,
    scores: emptyScores(players),
    roundNumber: 1,
    lastRoundScores: null,
    sevenChainTotal: 0,
    aceChainTotal: 0,
    postDrawPlay: false,
    pendingPrompt: null,
    lastPlay: null,
    message: 'Welcome! Lowest score wins. First to exceed 108 loses.',
  };
  return dealRound(base);
}

export function startNextRound(state: GameState): GameState {
  if (state.phase === 'matchOver') {
    return createInitialMatch();
  }
  return dealRound({
    ...state,
    roundNumber: state.roundNumber + 1,
    phase: 'playing',
    roundWinnerId: null,
    lastRoundScores: null,
  });
}

export function humanCanAct(state: GameState): boolean {
  if (state.phase !== 'playing') {
    return false;
  }
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  return state.currentPlayerIndex === humanIndex;
}

export function humanCanPlayCards(state: GameState): boolean {
  return humanCanAct(state) && !state.pendingPrompt;
}

export function getHumanPlayableStacks(state: GameState): Card[][] {
  const human = state.players.find((player) => player.isHuman);
  if (!human) {
    return [];
  }

  if (state.sevenChainTotal > 0) {
    const sevens = human.hand.filter((card) => card.rank === '7');
    if (sevens.length === 0) {
      return [];
    }
    const stacks: Card[][] = [];
    for (let size = 1; size <= sevens.length; size += 1) {
      stacks.push(sevens.slice(0, size));
    }
    return stacks;
  }

  return getPlayableStacks(human.hand, getTopCard(state.discardPile));
}

export function humanMustDraw(state: GameState): boolean {
  if (!humanCanAct(state)) {
    return false;
  }
  const human = state.players.find((player) => player.isHuman)!;
  if (state.sevenChainTotal > 0) {
    return !human.hand.some((card) => card.rank === '7');
  }
  return !hasPlayableCard(human.hand, getTopCard(state.discardPile));
}

export function humanCanDraw(state: GameState): boolean {
  if (!humanCanAct(state)) {
    return false;
  }
  if (state.postDrawPlay) {
    return false;
  }
  if (state.sevenChainTotal > 0) {
    return true;
  }
  return humanMustDraw(state);
}

export function humanCanPassAfterDraw(state: GameState): boolean {
  return humanCanAct(state) && state.postDrawPlay && !state.pendingPrompt;
}

export function passHumanTurn(state: GameState): GameState {
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (humanIndex === -1 || state.currentPlayerIndex !== humanIndex) {
    return state;
  }
  if (!state.postDrawPlay) {
    return { ...state, message: 'Nothing to pass.' };
  }
  return endTurn(state);
}

export function humanCanDeclare(state: GameState): boolean {
  if (state.phase !== 'playing') {
    return false;
  }
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (humanIndex === -1 || state.currentPlayerIndex === humanIndex) {
    return false;
  }
  const human = state.players[humanIndex];
  return needsDeclaration(human.hand) && !human.declared;
}

export function declareOneLeft(state: GameState): GameState {
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (humanIndex === -1) {
    return state;
  }

  if (humanCanAct(state)) {
    return { ...state, message: 'Declare after your turn ends.' };
  }

  if (!humanCanDeclare(state)) {
    return { ...state, message: 'You do not need to declare yet.' };
  }

  const players = state.players.map((player, index) =>
    index === humanIndex ? { ...player, declared: true } : player,
  );

  return {
    ...state,
    players,
    message: 'Declared: one card left!',
  };
}

export function playHumanCards(state: GameState, cardIds: string[], chosenSuit?: Suit): GameState {
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (humanIndex === -1 || !humanCanPlayCards(state)) {
    return state;
  }

  let next = playCards(state, humanIndex, cardIds, chosenSuit);

  if (next.pendingPrompt?.type === 'suitChoice') {
    return next;
  }

  return next;
}

export function drawHumanCard(state: GameState): GameState {
  const humanIndex = state.players.findIndex((player) => player.isHuman);
  if (humanIndex === -1 || state.currentPlayerIndex !== humanIndex) {
    return state;
  }

  return mustDraw(state, humanIndex);
}

export function completeSuitChoice(state: GameState, suit: Suit): GameState {
  const prompt = state.pendingPrompt;
  if (!prompt || prompt.type !== 'suitChoice') {
    return state;
  }

  let next = playCards(state, prompt.playerIndex, prompt.cardIds, suit);
  return next;
}

function pickAutomatedPlay(state: GameState, playerIndex: number): { cardIds: string[]; suit?: Suit } | null {
  const player = state.players[playerIndex];
  const topCard = getTopCard(state.discardPile);

  let stacks: Card[][];
  if (state.sevenChainTotal > 0) {
    const sevens = player.hand.filter((card) => card.rank === '7');
    if (sevens.length === 0) {
      return null;
    }
    stacks = [sevens];
  } else {
    stacks = getPlayableStacks(player.hand, topCard);
  }

  if (stacks.length === 0) {
    return null;
  }

  stacks.sort((a, b) => b.length - a.length);
  const choice = stacks[0];
  const rank = choice[0].rank;

  if (requiresSuitChoice(rank)) {
    const suitCounts = new Map<Suit, number>();
    for (const card of player.hand) {
      if (card.rank !== rank) {
        suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1);
      }
    }
    const suit = [...suitCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? choice[0].suit;
    return { cardIds: choice.map((card) => card.id), suit };
  }

  return { cardIds: choice.map((card) => card.id) };
}

function autoDeclare(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (!needsDeclaration(player.hand) || player.declared) {
    return state;
  }
  const players = state.players.map((p, index) =>
    index === playerIndex ? { ...p, declared: true } : p,
  );
  return {
    ...state,
    players,
    message: `${player.name} declares one card left.`,
  };
}

export function runSingleAutomatedTurn(state: GameState): GameState {
  if (state.phase !== 'playing') {
    return state;
  }

  const player = state.players[state.currentPlayerIndex];

  if (player.isHuman) {
    return beginHumanTurn(state);
  }

  let next = autoDeclare(state, state.currentPlayerIndex);
  const pick = pickAutomatedPlay(next, state.currentPlayerIndex);

  if (pick) {
    return playCards(next, state.currentPlayerIndex, pick.cardIds, pick.suit);
  }

  if (next.postDrawPlay) {
    return endTurn(next);
  }

  return mustDraw(next, state.currentPlayerIndex);
}

export function runAutomatedTurns(state: GameState): GameState {
  if (state.phase !== 'playing') {
    return state;
  }

  let next = { ...state };
  let safety = 0;

  while (safety < 24) {
    safety += 1;
    const player = next.players[next.currentPlayerIndex];

    if (player.isHuman) {
      return beginHumanTurn({ ...next, lastPlay: null });
    }

    next = runSingleAutomatedTurn(next);
    next = { ...next, lastPlay: null };

    if (next.phase !== 'playing') {
      return next;
    }
    if (next.pendingPrompt) {
      return next;
    }
  }

  return next;
}

export function startGame(): GameState {
  return runAutomatedTurns(createInitialMatch());
}

export function resetMatch(): GameState {
  return startGame();
}

export function getScoreboard(state: GameState): { id: string; name: string; score: number }[] {
  return state.players.map((player) => ({
    id: player.id,
    name: player.name,
    score: state.scores[player.id] ?? 0,
  }));
}
