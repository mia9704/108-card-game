import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { Card, Player, SeatPosition } from '../game/types';

type PlayerSeatProps = {
  player: Player;
  seat: SeatPosition;
  isActive: boolean;
  score?: number;
  selectedIds?: string[];
  playableIds?: Set<string>;
  canSelect?: boolean;
  compact?: boolean;
  sideWidth?: number;
  onCardPress?: (card: Card) => void;
};

function FaceDownFan({ cards, seat, compact }: { cards: Card[]; seat: SeatPosition; compact?: boolean }) {
  const isSideSeat = seat === 'left' || seat === 'right';
  const overlap = compact ? 46 : 50;

  return (
    <View style={[styles.fan, isSideSeat && styles.fanVertical]}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[
            styles.fanCard,
            isSideSeat
              ? { marginTop: index === 0 ? 0 : -overlap }
              : { marginLeft: index === 0 ? 0 : compact ? -24 : -28 },
          ]}
        >
          <PlayingCard card={card} faceDown compact />
        </View>
      ))}
    </View>
  );
}

export function PlayerSeat({
  player,
  seat,
  isActive,
  score,
  selectedIds = [],
  playableIds = new Set(),
  canSelect = false,
  compact = false,
  sideWidth,
  onCardPress,
}: PlayerSeatProps) {
  const isHuman = seat === 'bottom';
  const isSideSeat = seat === 'left' || seat === 'right';

  return (
    <View
      style={[
        styles.seat,
        styles[`seat_${seat}`],
        compact && seat === 'top' && styles.seat_topCompact,
        isSideSeat && sideWidth ? { width: sideWidth } : null,
        isSideSeat && compact && styles.seat_sideCompact,
        isActive && styles.seatActive,
      ]}
    >
      <View style={[styles.labelRow, seat === 'top' && styles.labelRowTop, compact && styles.labelRowCompact]}>
        <Text style={[styles.name, compact && styles.nameCompact]}>{player.name}</Text>
        <Text style={[styles.meta, compact && styles.metaCompact]}>
          {player.hand.length} cards{score !== undefined ? ` · ${score} pts` : ''}
        </Text>
        {player.declared ? <Text style={styles.declared}>1 left!</Text> : null}
        {isActive ? <View style={styles.turnDot} /> : null}
      </View>

      {isHuman ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.handScroll}
          contentContainerStyle={styles.humanHand}
        >
          {player.hand.map((card, index) => (
            <View key={card.id} style={[styles.fanCard, { marginLeft: index === 0 ? 0 : -24 }]}>
              <PlayingCard
                card={card}
                selected={canSelect && selectedIds.includes(card.id)}
                playable={canSelect && playableIds.has(card.id)}
                hideCalledSuit={card.rank === 'Q'}
                onPress={onCardPress ? () => onCardPress(card) : undefined}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <FaceDownFan cards={player.hand} seat={seat} compact={compact} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    maxWidth: '100%',
    overflow: 'visible',
  },
  seat_bottom: {
    width: '100%',
    minHeight: 148,
  },
  seat_top: {
    width: '92%',
    minHeight: 96,
    paddingTop: 4,
  },
  seat_topCompact: {
    minHeight: 72,
    paddingTop: 0,
    paddingHorizontal: 2,
  },
  seat_left: {
    width: 56,
    minHeight: 160,
  },
  seat_right: {
    width: 56,
    minHeight: 160,
  },
  seat_sideCompact: {
    minHeight: 120,
    padding: 2,
  },
  seatActive: {
    borderColor: '#f5c542',
    backgroundColor: 'rgba(245, 197, 66, 0.08)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  labelRowTop: {
    marginBottom: 6,
  },
  labelRowCompact: {
    gap: 4,
    marginBottom: 2,
  },
  name: {
    color: '#f7f3e8',
    fontWeight: '700',
    fontSize: 12,
  },
  nameCompact: {
    fontSize: 10,
  },
  meta: {
    color: '#a8d5c2',
    fontSize: 11,
  },
  metaCompact: {
    fontSize: 9,
  },
  declared: {
    color: '#f5c542',
    fontSize: 10,
    fontWeight: '700',
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5c542',
  },
  fan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fanCard: {
    overflow: 'visible',
  },
  handScroll: {
    overflow: 'visible',
  },
  humanHand: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
});
