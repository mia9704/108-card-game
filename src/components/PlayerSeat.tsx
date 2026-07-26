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
  onCardPress?: (card: Card) => void;
};

function FaceDownFan({ cards, seat }: { cards: Card[]; seat: SeatPosition }) {
  const isVertical = seat === 'left' || seat === 'right';

  return (
    <View style={[styles.fan, isVertical && styles.fanVertical, seat === 'left' && styles.fanLeft, seat === 'right' && styles.fanRight]}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[
            styles.fanCard,
            isVertical ? { marginTop: index === 0 ? 0 : -48 } : { marginLeft: index === 0 ? 0 : -28 },
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
  onCardPress,
}: PlayerSeatProps) {
  const isHuman = seat === 'bottom';

  return (
    <View style={[styles.seat, styles[`seat_${seat}`], isActive && styles.seatActive]}>
      <View style={[styles.labelRow, seat === 'top' && styles.labelRowTop]}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.meta}>
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
        <FaceDownFan cards={player.hand} seat={seat} />
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
  seat_left: {
    width: 88,
    minHeight: 160,
  },
  seat_right: {
    width: 88,
    minHeight: 160,
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
  name: {
    color: '#f7f3e8',
    fontWeight: '700',
    fontSize: 12,
  },
  meta: {
    color: '#a8d5c2',
    fontSize: 11,
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
  },
  fanLeft: {
    transform: [{ rotate: '90deg' }],
  },
  fanRight: {
    transform: [{ rotate: '-90deg' }],
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
