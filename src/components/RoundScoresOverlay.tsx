import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../game/types';

type RoundScoresOverlayProps = {
  game: GameState;
  onContinue: () => void;
  continueLabel: string;
};

export function RoundScoresOverlay({ game, onContinue, continueLabel }: RoundScoresOverlayProps) {
  const roundScores = game.lastRoundScores;
  if (!roundScores) {
    return null;
  }

  const winner = game.players.find((player) => player.id === game.roundWinnerId);

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>
          {game.phase === 'matchOver' ? 'Match Over' : `Round ${game.roundNumber} Complete`}
        </Text>
        {winner ? (
          <Text style={styles.winner}>{winner.name} wins the round!</Text>
        ) : null}

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerCell, styles.nameCol]}>Player</Text>
            <Text style={[styles.cell, styles.headerCell, styles.roundCol]}>Round</Text>
            <Text style={[styles.cell, styles.headerCell, styles.totalCol]}>Total</Text>
          </View>

          {game.players.map((player) => {
            const round = roundScores[player.id] ?? 0;
            const total = game.scores[player.id] ?? 0;
            const isWinner = player.id === game.roundWinnerId;

            return (
              <View key={player.id} style={[styles.dataRow, isWinner && styles.winnerRow]}>
                <Text style={[styles.cell, styles.nameCol, styles.nameText]}>
                  {player.name}
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

        {game.phase === 'matchOver' && game.matchWinnerId ? (
          <Text style={styles.matchWinner}>
            Match winner: {game.players.find((p) => p.id === game.matchWinnerId)?.name} (lowest
            score)
          </Text>
        ) : null}

        <Text style={styles.note}>Score exactly 108 resets to 54</Text>

        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>{continueLabel}</Text>
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
    maxWidth: 360,
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
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#d4d0c8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
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
    marginBottom: 14,
  },
  button: {
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
