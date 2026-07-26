import { StyleSheet, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { Card } from '../game/types';
import { cardShadow } from '../utils/shadows';
import { useTableCardMetrics } from '../utils/tableCardSize';

type TablePlayStackProps = {
  cards: Card[];
  pulse?: boolean;
};

export function TablePlayStack({ cards }: TablePlayStackProps) {
  const metrics = useTableCardMetrics();

  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.stack, { minHeight: metrics.height + 24, minWidth: metrics.width + 16 }]}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[
            styles.cardSlot,
            {
              marginLeft: index === 0 ? 0 : -metrics.overlap,
              zIndex: index,
              transform: [{ rotate: `${(index - (cards.length - 1) / 2) * 4}deg` }],
            },
          ]}
        >
          <PlayingCard card={card} tableMetrics={metrics} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingHorizontal: 8,
    overflow: 'visible',
  },
  cardSlot: {
    ...cardShadow({ opacity: 0.2, radius: 4, offsetY: 2, elevation: 4 }),
  },
});
