import { StyleSheet, View } from 'react-native';
import { PlayingCard } from './PlayingCard';
import { Card } from '../game/types';

type TablePlayStackProps = {
  cards: Card[];
  pulse?: boolean;
};

export function TablePlayStack({ cards }: TablePlayStackProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[
            styles.cardSlot,
            {
              marginLeft: index === 0 ? 0 : -36,
              zIndex: index,
              transform: [{ rotate: `${(index - (cards.length - 1) / 2) * 4}deg` }],
            },
          ]}
        >
          <PlayingCard card={card} compact />
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
    minHeight: 90,
    minWidth: 80,
    paddingTop: 6,
    paddingHorizontal: 8,
    overflow: 'visible',
  },
  cardSlot: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
