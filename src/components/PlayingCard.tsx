import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { isRedSuit, rankHint, rankLabel, suitSymbol } from '../game/cards';
import { Card, Suit } from '../game/types';
import { cardShadow } from '../utils/shadows';
import { TableCardMetrics } from '../utils/tableCardSize';

type PlayingCardProps = {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  playable?: boolean;
  compact?: boolean;
  tableMetrics?: TableCardMetrics;
  hideCalledSuit?: boolean;
  onPress?: () => void;
};

export function PlayingCard({
  card,
  faceDown = false,
  selected = false,
  playable = false,
  compact = false,
  tableMetrics,
  hideCalledSuit = false,
  onPress,
}: PlayingCardProps) {
  const red = isRedSuit(card.suit);
  const hint = rankHint(card.rank);
  const calledRed = card.calledSuit ? isRedSuit(card.calledSuit) : false;
  const tableCardStyle = tableMetrics ? getTableCardStyle(tableMetrics) : null;
  const tableTextStyles = tableMetrics ? getTableTextStyles(tableMetrics) : null;

  if (faceDown) {
    return (
      <View
        style={[
          styles.card,
          styles.cardBack,
          compact && !tableMetrics && styles.cardCompact,
          tableCardStyle,
        ]}
      >
        <Text style={[styles.backPattern, tableTextStyles?.backPattern]}>108</Text>
      </View>
    );
  }

  const cardFace = (
    <View
      style={[
        styles.card,
        compact && !tableMetrics && styles.cardCompact,
        tableCardStyle,
        selected && styles.cardSelected,
        playable && styles.cardPlayable,
      ]}
    >
      <Text style={[styles.rank, tableTextStyles?.rank, red ? styles.red : styles.black]}>
        {rankLabel(card.rank)}
      </Text>
      <Text style={[styles.suit, tableTextStyles?.suit, red ? styles.red : styles.black]}>
        {suitSymbol(card.suit)}
      </Text>
      {hint ? <Text style={[styles.hint, tableTextStyles?.hint]}>{hint}</Text> : null}
    </View>
  );

  const content = (
    <View style={[styles.wrapper, selected && styles.wrapperSelected]}>
      {cardFace}
      {card.calledSuit && !hideCalledSuit ? (
        <Text
          style={[
            styles.calledSuitNote,
            tableTextStyles?.calledSuit,
            calledRed ? styles.red : styles.black,
          ]}
        >
          Calls {suitSymbol(card.calledSuit)}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function getTableCardStyle(metrics: TableCardMetrics): ViewStyle {
  return {
    width: metrics.width,
    height: metrics.height,
    padding: metrics.padding,
    borderRadius: metrics.borderRadius,
    marginHorizontal: 2,
  };
}

function getTableTextStyles(metrics: TableCardMetrics) {
  return {
    rank: { fontSize: metrics.rankSize },
    suit: { fontSize: metrics.suitSize, marginTop: Math.max(2, Math.round(metrics.suitSize * 0.15)) },
    hint: { fontSize: metrics.hintSize, marginTop: Math.max(4, Math.round(metrics.hintSize * 0.7)) },
    calledSuit: { fontSize: metrics.calledSuitSize },
    backPattern: { fontSize: metrics.backPatternSize },
  };
}

export function SuitPicker({
  title,
  onSelect,
  onCancel,
}: {
  title?: string;
  onSelect: (suit: Suit) => void;
  onCancel: () => void;
}) {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  return (
    <View style={styles.suitPickerOverlay}>
      <View style={styles.suitPicker}>
        <Text style={styles.suitPickerTitle}>{title ?? 'Choose a suit'}</Text>
        <View style={styles.suitRow}>
          {suits.map((suit) => (
            <Pressable key={suit} style={styles.suitButton} onPress={() => onSelect(suit)}>
              <Text
                style={[
                  styles.suitButtonText,
                  isRedSuit(suit) ? styles.red : styles.black,
                ]}
              >
                {suitSymbol(suit)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  card: {
    width: 72,
    height: 104,
    borderRadius: 10,
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#d4d0c8',
    padding: 8,
    ...cardShadow({ opacity: 0.15, radius: 4, offsetY: 2, elevation: 3 }),
  },
  cardCompact: {
    width: 44,
    height: 64,
    padding: 4,
    marginHorizontal: 2,
  },
  cardBack: {
    backgroundColor: '#1e4d3a',
    borderColor: '#163a2c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPattern: {
    color: '#c9f0df',
    fontWeight: '700',
    fontSize: 12,
  },
  cardSelected: {
    borderColor: '#f5c542',
    borderWidth: 3,
  },
  wrapperSelected: {
    marginTop: -10,
    paddingBottom: 10,
  },
  cardPlayable: {
    borderColor: '#7dcea0',
  },
  pressed: {
    opacity: 0.85,
  },
  rank: {
    fontSize: 18,
    fontWeight: '700',
  },
  suit: {
    fontSize: 24,
    marginTop: 4,
  },
  hint: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '600',
    color: '#555',
  },
  calledSuitNote: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  red: {
    color: '#c0392b',
  },
  black: {
    color: '#1c2833',
  },
  suitPickerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  suitPicker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  suitPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  suitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  suitButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suitButtonText: {
    fontSize: 28,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});
