import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { cardPoints } from '../game/scoring';
import { GameState } from '../game/types';
import { useTranslation } from '../i18n/LanguageContext';

type RoundScoresOverlayProps = {
  game: GameState;
  onContinue: () => void;
  continueLabel: string;
};

export function RoundScoresOverlay({ game, onContinue, continueLabel }: RoundScoresOverlayProps) {
  const { t, playerName, formatMessage } = useTranslation();
  const roundScores = game.lastRoundScores;
  if (!roundScores) {
    return null;
  }

  const winner = game.players.find((player) => player.id === game.roundWinnerId);

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>
          {game.phase === 'matchOver'
            ? t('ui.matchOver')
            : t('ui.roundComplete', { round: game.roundNumber })}
        </Text>
        {winner ? (
          <Text style={styles.winner}>
            {winner.name === 'You'
              ? t('ui.winRound')
              : t('ui.winsRound', { name: playerName(winner.name) })}
          </Text>
        ) : null}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.headerCell, styles.nameCol]}>{t('ui.player')}</Text>
              <Text style={[styles.cell, styles.headerCell, styles.roundCol]}>{t('ui.roundCol')}</Text>
              <Text style={[styles.cell, styles.headerCell, styles.totalCol]}>{t('ui.total')}</Text>
            </View>

            {game.players.map((player) => {
              const round = roundScores[player.id] ?? 0;
              const total = game.scores[player.id] ?? 0;
              const isWinner = player.id === game.roundWinnerId;

              return (
                <View key={player.id} style={[styles.dataRow, isWinner && styles.winnerRow]}>
                  <Text style={[styles.cell, styles.nameCol, styles.nameText]}>
                    {playerName(player.name)}
                    {isWinner ? ' ★' : ''}
                  </Text>
                  <Text style={[styles.cell, styles.roundCol, round > 0 && styles.positiveScore]}>
                    {round > 0 ? `+${round}` : round}
                  </Text>
                  <Text style={[styles.cell, styles.totalCol, styles.totalText]}>{total}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.handsTitle}>{t('ui.hands')}</Text>
          {game.players.map((player) => {
            const isWinner = player.id === game.roundWinnerId;

            return (
              <View key={`${player.id}-hand`} style={[styles.handBlock, isWinner && styles.winnerHandBlock]}>
                <Text style={styles.handPlayerName}>
                  {playerName(player.name)}
                  {isWinner ? ' ★' : ''}
                </Text>
                {player.hand.length === 0 ? (
                  <Text style={styles.outText}>{t('ui.outNoCards')}</Text>
                ) : (
                  <View style={styles.handCards}>
                    {player.hand.map((card) => (
                      <PlayingCard
                        key={card.id}
                        card={card}
                        compact
                        hideCalledSuit
                        hideHint
                        points={cardPoints(card)}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {game.phase === 'matchOver' && game.matchWinnerId ? (
            <Text style={styles.matchWinner}>
              {t('ui.matchWinnerLowest', {
                name: playerName(
                  game.players.find((p) => p.id === game.matchWinnerId)?.name ?? '',
                ),
              })}
            </Text>
          ) : null}

          <Text style={styles.note}>{t('ui.score108Reset')}</Text>
          {game.message ? (
            <Text style={styles.roundMessage}>{formatMessage(game.message)}</Text>
          ) : null}
        </ScrollView>

        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText} pointerEvents="none">
            {continueLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    padding: 20,
  },
  panel: {
    backgroundColor: '#fffef8',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c2833',
    textAlign: 'center',
  },
  winner: {
    fontSize: 15,
    color: '#2d8659',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#d4d0c8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#124832',
  },
  dataRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e8e4dc',
  },
  winnerRow: {
    backgroundColor: 'rgba(245, 197, 66, 0.15)',
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1c2833',
  },
  headerCell: {
    color: '#f7f3e8',
    fontWeight: '700',
    fontSize: 13,
  },
  nameCol: {
    flex: 2,
  },
  roundCol: {
    flex: 1,
    textAlign: 'center',
  },
  totalCol: {
    flex: 1,
    textAlign: 'right',
  },
  nameText: {
    fontWeight: '600',
  },
  totalText: {
    fontWeight: '700',
  },
  positiveScore: {
    color: '#c0392b',
  },
  handsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c2833',
    marginBottom: 10,
  },
  handBlock: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f4f2eb',
    overflow: 'visible',
  },
  winnerHandBlock: {
    backgroundColor: 'rgba(245, 197, 66, 0.18)',
  },
  handPlayerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c2833',
    marginBottom: 8,
  },
  handCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    overflow: 'visible',
  },
  outText: {
    fontSize: 13,
    color: '#2d8659',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  matchWinner: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#1a5c42',
    marginBottom: 8,
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  roundMessage: {
    textAlign: 'center',
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#f5c542',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    color: '#1c2833',
    fontSize: 16,
  },
});
