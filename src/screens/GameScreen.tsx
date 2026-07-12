import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CardPlayAnimation } from '../components/CardPlayAnimation';
import { PlayerSeat } from '../components/PlayerSeat';
import { PlayingCard, SuitPicker } from '../components/PlayingCard';
import { TablePlayStack } from '../components/TablePlayStack';
import { RoundScoresOverlay } from '../components/RoundScoresOverlay';
import { isSameRankStack } from '../game/rules';
import {
  clearLastPlay,
  completeSuitChoice,
  declareOneLeft,
  drawHumanCard,
  getHumanPlayableStacks,
  getScoreboard,
  humanCanAct,
  humanCanDraw,
  humanCanPassAfterDraw,
  humanCanPlayCards,
  passHumanTurn,
  playHumanCards,
  resetMatch,
  runSingleAutomatedTurn,
  shouldContinueAutomation,
  startGame,
  startNextRound,
} from '../game/gameEngine';
import { Card, GameState, PLAYER_SEATS, SeatPosition, Suit } from '../game/types';

export function GameScreen() {
  const [game, setGame] = useState<GameState>(() => startGame());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [animatingPlay, setAnimatingPlay] = useState(false);
  const [tablePlay, setTablePlay] = useState<Card[]>([]);
  const automationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const discardPulse = useRef(new Animated.Value(1)).current;

  const human = game.players[0];
  const topCard = game.discardPile[game.discardPile.length - 1];
  const playableStacks = useMemo(() => getHumanPlayableStacks(game), [game]);
  const playableIds = new Set(playableStacks.flatMap((stack) => stack.map((card) => card.id)));
  const isYourTurn = humanCanAct(game);
  const canPlayCards = humanCanPlayCards(game);
  const canDraw = humanCanDraw(game);
  const canPassAfterDraw = humanCanPassAfterDraw(game);
  const scoreboard = getScoreboard(game);
  const suitPrompt = game.pendingPrompt?.type === 'suitChoice' ? game.pendingPrompt : null;
  const lastPlay = game.lastPlay;
  const showRoundScores =
    (game.phase === 'roundOver' || game.phase === 'matchOver') &&
    game.lastRoundScores &&
    !animatingPlay &&
    !lastPlay;

  const pulseDiscard = useCallback(() => {
    discardPulse.setValue(1);
    Animated.sequence([
      Animated.timing(discardPulse, {
        toValue: 1.12,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(discardPulse, {
        toValue: 1,
        duration: 180,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [discardPulse]);

  const handleAnimationComplete = useCallback(() => {
    setAnimatingPlay(false);
    pulseDiscard();
    setGame((current) => {
      if (current.lastPlay) {
        setTablePlay(current.lastPlay.cards);
      }
      return clearLastPlay(current);
    });
  }, [pulseDiscard]);

  useEffect(() => {
    if (tablePlay.length === 0 && game.discardPile.length > 0) {
      setTablePlay([game.discardPile[game.discardPile.length - 1]]);
    }
  }, [game.discardPile, tablePlay.length]);

  useEffect(() => {
    if (lastPlay && !animatingPlay && !suitPrompt) {
      setAnimatingPlay(true);
    }
  }, [lastPlay, animatingPlay, suitPrompt]);

  useEffect(() => {
    if (automationTimer.current) {
      clearTimeout(automationTimer.current);
    }

    if (animatingPlay || lastPlay || suitPrompt) {
      return;
    }

    if (shouldContinueAutomation(game)) {
      automationTimer.current = setTimeout(() => {
        setGame((current) => runSingleAutomatedTurn(current));
      }, 350);
    }

    return () => {
      if (automationTimer.current) {
        clearTimeout(automationTimer.current);
      }
    };
  }, [game, animatingPlay, lastPlay, suitPrompt]);

  function toggleSelect(card: Card) {
    if (!canPlayCards) {
      return;
    }

    setSelectedIds((current) => {
      if (current.includes(card.id)) {
        return current.filter((id) => id !== card.id);
      }

      if (current.length === 0) {
        return [card.id];
      }

      const selectedCards = current
        .map((id) => human.hand.find((c) => c.id === id))
        .filter((c): c is Card => Boolean(c));

      if (selectedCards[0]?.rank !== card.rank) {
        return [card.id];
      }

      return [...current, card.id];
    });
  }

  function handlePlaySelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const cards = selectedIds
      .map((id) => human.hand.find((card) => card.id === id))
      .filter((card): card is Card => Boolean(card));

    if (!isSameRankStack(cards)) {
      return;
    }

    setGame((current) => playHumanCards(current, selectedIds));
    setSelectedIds([]);
  }

  function handleDraw() {
    setGame((current) => drawHumanCard(current));
    setSelectedIds([]);
  }

  function handlePass() {
    setGame((current) => passHumanTurn(current));
    setSelectedIds([]);
  }

  function handleDeclare() {
    setGame((current) => declareOneLeft(current));
  }

  function handleSuitSelect(suit: Suit) {
    setGame((current) => completeSuitChoice(current, suit));
    setSelectedIds([]);
  }

  function handleNextRound() {
    const next = startNextRound(game);
    setGame(next);
    setTablePlay(next.discardPile.slice(-1));
    setSelectedIds([]);
    setAnimatingPlay(false);
  }

  function handleNewMatch() {
    const next = resetMatch();
    setGame(next);
    setTablePlay(next.discardPile.slice(-1));
    setSelectedIds([]);
    setAnimatingPlay(false);
  }

  function getPlayerAtSeat(seat: SeatPosition) {
    const index = PLAYER_SEATS.indexOf(seat);
    return game.players[index];
  }

  function getScoreForPlayer(playerId: string) {
    return scoreboard.find((entry) => entry.id === playerId)?.score ?? 0;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>108 Card Game</Text>
        <Text style={styles.subtitle}>Round {game.roundNumber} · 32-card deck · 5 each</Text>
      </View>

      <View style={styles.tableArea}>
        <View style={styles.topSeat}>
          <PlayerSeat
            player={getPlayerAtSeat('top')}
            seat="top"
            isActive={game.currentPlayerIndex === 1}
            score={getScoreForPlayer(getPlayerAtSeat('top').id)}
          />
        </View>

        <View style={styles.middleRow}>
          <View style={styles.sideSeat}>
            <PlayerSeat
              player={getPlayerAtSeat('left')}
              seat="left"
              isActive={game.currentPlayerIndex === 2}
              score={getScoreForPlayer(getPlayerAtSeat('left').id)}
            />
          </View>

          <View style={styles.center}>
            <View style={styles.pileRow}>
              <Animated.View style={{ transform: [{ scale: discardPulse }] }}>
                <TablePlayStack cards={animatingPlay && lastPlay ? [] : tablePlay} />
              </Animated.View>
              <View style={styles.drawPile}>
                <PlayingCard card={topCard} faceDown />
                <Text style={styles.drawCount}>{game.drawPile.length}</Text>
              </View>
            </View>

            {game.sevenChainTotal > 0 ? (
              <Text style={styles.chainText}>
                7-chain: {game.sevenChainTotal} · penalty {7 * game.sevenChainTotal}
              </Text>
            ) : null}
            {game.aceChainTotal > 0 ? (
              <Text style={styles.chainText}>Ace chain: {game.aceChainTotal} skips</Text>
            ) : null}

            <Text style={styles.message}>{game.message}</Text>
          </View>

          <View style={styles.sideSeat}>
            <PlayerSeat
              player={getPlayerAtSeat('right')}
              seat="right"
              isActive={game.currentPlayerIndex === 3}
              score={getScoreForPlayer(getPlayerAtSeat('right').id)}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <PlayerSeat
          player={human}
          seat="bottom"
          isActive={game.currentPlayerIndex === 0}
          score={getScoreForPlayer(human.id)}
          selectedIds={selectedIds}
          playableIds={playableIds}
          canSelect={canPlayCards}
          onCardPress={toggleSelect}
        />

        {isYourTurn && game.phase === 'playing' ? (
          <View style={styles.actions}>
            {canPlayCards ? (
              <Pressable
                style={[styles.secondaryButton, selectedIds.length === 0 && styles.buttonDisabled]}
                onPress={handlePlaySelected}
                disabled={selectedIds.length === 0}
              >
                <Text style={styles.secondaryButtonText}>
                  Play{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </Text>
              </Pressable>
            ) : null}
            {canDraw ? (
              <Pressable style={styles.secondaryButton} onPress={handleDraw}>
                <Text style={styles.secondaryButtonText}>
                  {game.sevenChainTotal > 0 ? `Take ${7 * game.sevenChainTotal}` : 'Draw'}
                </Text>
              </Pressable>
            ) : null}
            {canPassAfterDraw ? (
              <Pressable style={styles.secondaryButton} onPress={handlePass}>
                <Text style={styles.secondaryButtonText}>Pass</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.declareButton} onPress={handleDeclare}>
              <Text style={styles.declareButtonText}>Declare One Left</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {lastPlay && animatingPlay ? (
        <CardPlayAnimation
          cards={lastPlay.cards}
          seat={PLAYER_SEATS[lastPlay.playerIndex]}
          onComplete={handleAnimationComplete}
        />
      ) : null}

      {suitPrompt ? (
        <SuitPicker
          title="Choose a suit for Queen"
          onSelect={handleSuitSelect}
          onCancel={() => setGame((current) => ({ ...current, pendingPrompt: null }))}
        />
      ) : null}

      {showRoundScores ? (
        <RoundScoresOverlay
          game={game}
          onContinue={game.phase === 'matchOver' ? handleNewMatch : handleNextRound}
          continueLabel={game.phase === 'matchOver' ? 'New Match' : 'Next Round'}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1a5c42',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    color: '#f7f3e8',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cfe8db',
    marginTop: 2,
    fontSize: 12,
  },
  tableArea: {
    flex: 1,
    paddingHorizontal: 4,
  },
  topSeat: {
    alignItems: 'center',
    paddingTop: 2,
  },
  middleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSeat: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  drawPile: {
    alignItems: 'center',
  },
  drawCount: {
    color: '#e8f5ef',
    marginTop: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  chainText: {
    color: '#f5c542',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  message: {
    color: '#f7f3e8',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    paddingHorizontal: 8,
  },
  bottomArea: {
    backgroundColor: '#124832',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#f5c542',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: '#1c2833',
  },
  secondaryButton: {
    backgroundColor: '#2d8659',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  declareButton: {
    backgroundColor: '#f5c542',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  declareButtonText: {
    color: '#1c2833',
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
