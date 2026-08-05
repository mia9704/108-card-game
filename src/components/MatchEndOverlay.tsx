import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n/LanguageContext';
import { GameState } from '../game/types';

type MatchEndOverlayProps = {
  game: GameState;
  onNewGame: () => void;
  onDismiss: () => void;
};

export function MatchEndOverlay({ game, onNewGame, onDismiss }: MatchEndOverlayProps) {
  const { t, playerName } = useTranslation();
  const matchWinner = game.players.find((player) => player.id === game.matchWinnerId);
  const standings = [...game.players].sort(
    (a, b) => (game.scores[a.id] ?? 0) - (game.scores[b.id] ?? 0),
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>{t('ui.gameOver')}</Text>
        {matchWinner ? (
          <Text style={styles.winner}>
            {matchWinner.name === 'You'
              ? t('ui.winMatch')
              : t('ui.winsMatch', { name: playerName(matchWinner.name) })}
          </Text>
        ) : null}

        <View style={styles.standings}>
          <Text style={styles.standingsTitle}>{t('ui.finalStandings')}</Text>
          {standings.map((player, index) => {
            const isWinner = player.id === game.matchWinnerId;
            return (
              <View key={player.id} style={[styles.standingRow, isWinner && styles.standingRowWinner]}>
                <Text style={[styles.place, isWinner && styles.placeWinner]}>{index + 1}.</Text>
                <Text style={[styles.playerName, isWinner && styles.playerNameWinner]}>
                  {playerName(player.name)}
                  {isWinner ? ' ★' : ''}
                </Text>
                <Text style={[styles.score, isWinner && styles.scoreWinner]}>
                  {t('ui.pts', { score: game.scores[player.id] ?? 0 })}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.prompt}>{t('ui.promptNewGame')}</Text>

        <Pressable style={styles.primaryButton} onPress={onNewGame}>
          <Text style={styles.primaryButtonText} pointerEvents="none">
            {t('ui.newGame')}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onDismiss}>
          <Text style={styles.secondaryButtonText} pointerEvents="none">
            {t('ui.notNow')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    padding: 20,
  },
  panel: {
    backgroundColor: '#fffef8',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a5c42',
    textAlign: 'center',
  },
  winner: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d8659',
    textAlign: 'center',
    marginTop: 8,
  },
  standings: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d4d0c8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  standingsTitle: {
    backgroundColor: '#124832',
    color: '#f7f3e8',
    fontWeight: '700',
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e4dc',
  },
  standingRowWinner: {
    backgroundColor: 'rgba(245, 197, 66, 0.18)',
  },
  place: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  placeWinner: {
    color: '#1a5c42',
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1c2833',
  },
  playerNameWinner: {
    color: '#1a5c42',
  },
  score: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c2833',
  },
  scoreWinner: {
    color: '#1a5c42',
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c2833',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#f5c542',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '800',
    color: '#1c2833',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '700',
    color: '#666',
    fontSize: 15,
  },
});
