import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { getDiscardAnchor, getSeatAnchor } from './seatAnchors';
import { Card, SeatPosition } from '../game/types';

const HUMAN_DURATION = 720;
const HUMAN_STAGGER = 180;
const CPU_DURATION = 980;
const CPU_STAGGER = 260;

type CardPlayAnimationProps = {
  cards: Card[];
  seat: SeatPosition;
  slow?: boolean;
  onComplete: () => void;
};

function FlyingCard({
  card,
  seat,
  index,
  total,
  duration,
  stagger,
  onDone,
}: {
  card: Card;
  seat: SeatPosition;
  index: number;
  total: number;
  duration: number;
  stagger: number;
  onDone: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const start = getSeatAnchor(seat);
  const end = getDiscardAnchor();
  const cardWidth = 44;
  const cardHeight = 64;
  const spread = (index - (total - 1) / 2) * 22;

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
    outputRange: [start.x - cardWidth / 2 + spread, end.x - cardWidth / 2 + spread * 0.35],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start.y - cardHeight / 2, end.y - cardHeight / 2 - index * 2],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0.8, 1.08, 1],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${spread * 0.5}deg`, `${(index - (total - 1) / 2) * 4}deg`],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0.6, 1, 1],
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
      <PlayingCard card={card} compact />
    </Animated.View>
  );
}

export function CardPlayAnimation({ cards, seat, slow = false, onComplete }: CardPlayAnimationProps) {
  const completed = useRef(0);
  const duration = slow ? CPU_DURATION : HUMAN_DURATION;
  const stagger = slow ? CPU_STAGGER : HUMAN_STAGGER;

  function handleCardDone() {
    completed.current += 1;
    if (completed.current >= cards.length) {
      onComplete();
    }
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {cards.map((card, index) => (
        <FlyingCard
          key={`${card.id}-${index}`}
          card={card}
          seat={seat}
          index={index}
          total={cards.length}
          duration={duration}
          stagger={stagger}
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
