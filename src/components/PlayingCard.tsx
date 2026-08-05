import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { isRedSuit, rankHint, rankLabel, suitSymbol } from '../game/cards';
import { Card, Suit } from '../game/types';
import { useTranslation } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { cardShadow } from '../utils/shadows';
import { TableCardMetrics } from '../utils/tableCardSize';

const HINT_KEYS: Record<string, TranslationKey> = {
  '7-chain': 'hints.sevenChain',
  Wild: 'hints.wild',
  Skip: 'hints.skip',
};

type PlayingCardProps = {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  playable?: boolean;
  compact?: boolean;
  tableMetrics?: TableCardMetrics;
  hideCalledSuit?: boolean;
  hideHint?: boolean;
  points?: number;
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
  hideHint = false,
  points,
  onPress,
}: PlayingCardProps) {
  const { t } = useTranslation();
  const red = isRedSuit(card.suit);
  const hint = rankHint(card.rank);
  const hintText = hint ? t(HINT_KEYS[hint]) : null;
  const calledRed = card.calledSuit ? isRedSuit(card.calledSuit) : false;
  const metrics = tableMetrics;
  const metricCardStyle = metrics ? getMetricCardStyle(metrics) : null;
  const metricTextStyles = metrics ? getMetricTextStyles(metrics) : null;

  if (faceDown) {
    return (
      <View
        style={[
          styles.card,
          styles.cardBack,
          compact && !metrics && styles.cardCompact,
          metricCardStyle,
        ]}
      >
        <Text style={[styles.backPattern, metricTextStyles?.backPattern]}>108</Text>
      </View>
    );
  }

  const cardFace = (
    <View
      style={[
        styles.card,
        compact && !metrics && styles.cardCompact,
        metricCardStyle,
        selected && styles.cardSelected,
        playable && styles.cardPlayable,
      ]}
    >
      <Text style={[styles.rank, metricTextStyles?.rank, red ? styles.red : styles.black]}>
        {rankLabel(card.rank)}
      </Text>
      <Text style={[styles.suit, metricTextStyles?.suit, red ? styles.red : styles.black]}>
        {suitSymbol(card.suit)}
      </Text>
      {hintText && !hideHint ? <Text style={[styles.hint, metricTextStyles?.hint]}>{hintText}</Text> : null}
    </View>
  );

  const content = (
    <View style={[styles.wrapper, selected && styles.wrapperSelected]}>
      {cardFace}
      {card.calledSuit && !hideCalledSuit ? (
        <Text
          style={[
            styles.calledSuitNote,
            metricTextStyles?.calledSuit,
            calledRed ? styles.red : styles.black,
          ]}
        >
          {t('ui.callsSuit', { suit: suitSymbol(card.calledSuit) })}
        </Text>
      ) : null}
      {points !== undefined ? (
        <Text style={[styles.pointsLabel, points === 0 && styles.pointsLabelZero]}>
          {points > 0 ? `+${points}` : points}
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

function getMetricCardStyle(metrics: TableCardMetrics): ViewStyle {
  return {
    width: metrics.width,
    height: metrics.height,
    padding: metrics.padding,
    borderRadius: metrics.borderRadius,
    marginHorizontal: 2,
  };
}

function getMetricTextStyles(metrics: TableCardMetrics) {
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
  const { t } = useTranslation();
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  return (
    <View style={styles.suitPickerOverlay}>
      <View style={styles.suitPicker}>
        <Text style={styles.suitPickerTitle}>{title ?? t('ui.chooseSuit')}</Text>
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
          <Text style={styles.cancelText}>{t('ui.cancel')}</Text>
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
  pointsLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#c0392b',
  },
  pointsLabelZero: {
    color: '#666',
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
