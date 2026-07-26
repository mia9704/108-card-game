import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { getDrawPileAnchor, getSeatAnchor } from './seatAnchors';
import { Card, SeatPosition } from '../game/types';
import { cardShadow } from '../utils/shadows';
import { TableCardMetrics, useTableCardMetrics } from '../utils/tableCardSize';

const HUMAN_DURATION = 680;
const HUMAN_STAGGER = 140;
const CPU_DURATION = 900;
const CPU_STAGGER = 200;
const MAX_ANIMATED_CARDS = 10;

type CardDrawAnimationProps = {
  cards: Card[];
  seat: SeatPosition;
  slow?: boolean;
  onComplete: () => void;
};

function FlyingDrawCard({
  card,
  seat,
  index,
  total,
  duration,
  stagger,
  metrics,
  onDone,
}: {
  card: Card;
  seat: SeatPosition;
  index: number;
  total: number;
  duration: number;
  stagger: number;
  metrics: TableCardMetrics;
  onDone: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const start = getDrawPileAnchor(metrics.width);
  const end = getSeatAnchor(seat);
  const cardWidth = metrics.width;
  const cardHeight = metrics.height;
  const spread = (index - (total - 1) / 2) * metrics.width * 0.35;
  const faceDown = seat !== 'bottom';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: index * stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
  }, [duration, index, onDone, progress, stagger]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start.x - cardWidth / 2 + spread * 0.35, end.x - cardWidth / 2 + spread],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start.y - cardHeight / 2 - index * 2, end.y - cardHeight / 2],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0.85, 1.05, 1],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${(index - (total - 1) / 2) * 6}deg`, `${spread * 0.25}deg`],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0.5, 1, 1],
  });

  return (
    <Animated.View
      style={[
        styles.flyingCard,
        {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
        },
      ]}
    >
      <PlayingCard card={card} faceDown={faceDown} tableMetrics={metrics} />
    </Animated.View>
  );
}

export function CardDrawAnimation({ cards, seat, slow = false, onComplete }: CardDrawAnimationProps) {
  const completed = useRef(0);
  const metrics = useTableCardMetrics();
  const duration = slow ? CPU_DURATION : HUMAN_DURATION;
  const stagger = slow ? CPU_STAGGER : HUMAN_STAGGER;
  const visibleCards =
    cards.length > MAX_ANIMATED_CARDS
      ? cards.slice(cards.length - MAX_ANIMATED_CARDS)
      : cards;

  function handleCardDone() {
    completed.current += 1;
    if (completed.current >= visibleCards.length) {
      onComplete();
    }
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {visibleCards.map((card, index) => (
        <FlyingDrawCard
          key={`${card.id}-draw-${index}`}
          card={card}
          seat={seat}
          index={index}
          total={visibleCards.length}
          duration={duration}
          stagger={stagger}
          metrics={metrics}
          onDone={handleCardDone}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  flyingCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    ...cardShadow({ opacity: 0.25, radius: 8, offsetY: 4, elevation: 8 }),
  },
});
