import { useCallback, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlayingCard } from './PlayingCard';
import { Card, Player, SeatPosition } from '../game/types';
import { useTranslation } from '../i18n/LanguageContext';

const HAND_OVERLAP = -24;
const HAND_CARD_STEP = 72 + HAND_OVERLAP;
const SCROLL_EDGE_THRESHOLD = 8;

type ScrollHintState = {
  viewportWidth: number;
  contentWidth: number;
  scrollX: number;
};

function getScrollHints({ viewportWidth, contentWidth, scrollX }: ScrollHintState) {
  const isScrollable = contentWidth > viewportWidth + 1;
  if (!isScrollable) {
    return { isScrollable: false, showLeft: false, showRight: false };
  }

  const maxScrollX = contentWidth - viewportWidth;
  return {
    isScrollable: true,
    showLeft: scrollX > SCROLL_EDGE_THRESHOLD,
    showRight: scrollX < maxScrollX - SCROLL_EDGE_THRESHOLD,
  };
}

function HumanHand({
  cards,
  selectedIds,
  playableIds,
  canSelect,
  isActive,
  onCardPress,
}: {
  cards: Card[];
  selectedIds: string[];
  playableIds: Set<string>;
  canSelect: boolean;
  isActive: boolean;
  onCardPress?: (card: Card) => void;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollState, setScrollState] = useState<ScrollHintState>({
    viewportWidth: 0,
    contentWidth: 0,
    scrollX: 0,
  });
  const { showLeft, showRight } = getScrollHints(scrollState);

  const scrollHand = useCallback(
    (direction: 'left' | 'right') => {
      const { scrollX, viewportWidth, contentWidth } = scrollState;
      const maxScrollX = Math.max(0, contentWidth - viewportWidth);
      const delta = Math.max(HAND_CARD_STEP * 2, viewportWidth * 0.45);
      const nextX =
        direction === 'left'
          ? Math.max(0, scrollX - delta)
          : Math.min(maxScrollX, scrollX + delta);

      scrollRef.current?.scrollTo({ x: nextX, animated: true });
    },
    [scrollState],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setScrollState((current) => ({
      ...current,
      viewportWidth: event.nativeEvent.layout.width,
    }));
  }, []);

  const handleContentSizeChange = useCallback((width: number) => {
    setScrollState((current) => ({
      ...current,
      contentWidth: width,
    }));
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollState((current) => ({
      ...current,
      scrollX: event.nativeEvent.contentOffset.x,
    }));
  }, []);

  return (
    <View style={[styles.handScrollWrap, isActive ? styles.handActive : styles.handIdle]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.handScroll}
        contentContainerStyle={styles.humanHand}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {cards.map((card, index) => (
          <View
            key={card.id}
            style={[styles.fanCard, { marginLeft: index === 0 ? 0 : HAND_OVERLAP }]}
          >
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

      {showLeft ? (
        <Pressable
          style={({ pressed }) => [
            styles.scrollHint,
            styles.scrollHintLeft,
            pressed && styles.scrollHintPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('ui.scrollLeft')}
          onPress={() => scrollHand('left')}
        >
          <Text style={styles.scrollHintIcon}>‹</Text>
        </Pressable>
      ) : null}
      {showRight ? (
        <Pressable
          style={({ pressed }) => [
            styles.scrollHint,
            styles.scrollHintRight,
            pressed && styles.scrollHintPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('ui.scrollRight')}
          onPress={() => scrollHand('right')}
        >
          <Text style={styles.scrollHintIcon}>›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

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

function FaceDownFan({
  cards,
  seat,
  compact,
  isActive,
}: {
  cards: Card[];
  seat: SeatPosition;
  compact?: boolean;
  isActive: boolean;
}) {
  const isSideSeat = seat === 'left' || seat === 'right';
  const overlap = compact ? 46 : 50;

  return (
    <View
      style={[
        styles.fan,
        isSideSeat && styles.fanVertical,
        isActive ? styles.handActive : styles.handIdle,
      ]}
    >
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
  const { t, playerName } = useTranslation();
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
      ]}
    >
      <View style={[styles.labelRow, seat === 'top' && styles.labelRowTop, compact && styles.labelRowCompact]}>
        <Text style={[styles.name, compact && styles.nameCompact]}>{playerName(player.name)}</Text>
        <Text style={[styles.meta, compact && styles.metaCompact]}>
          {score !== undefined
            ? t('ui.cardsWithScore', { count: player.hand.length, score })
            : t('ui.cards', { count: player.hand.length })}
        </Text>
        {player.declared ? <Text style={styles.declared}>{t('ui.oneLeft')}</Text> : null}
      </View>

      {isHuman ? (
        <HumanHand
          cards={player.hand}
          selectedIds={selectedIds}
          playableIds={playableIds}
          canSelect={canSelect}
          isActive={isActive}
          onCardPress={onCardPress}
        />
      ) : (
        <FaceDownFan cards={player.hand} seat={seat} compact={compact} isActive={isActive} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
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
  handActive: {
    borderTopWidth: 2,
    borderTopColor: '#f5c542',
  },
  handIdle: {
    borderTopWidth: 2,
    borderTopColor: 'transparent',
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
  handScrollWrap: {
    width: '100%',
    position: 'relative',
  },
  handScroll: {
    width: '100%',
    overflow: 'visible',
  },
  humanHand: {
    flexGrow: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  scrollHint: {
    position: 'absolute',
    bottom: 8,
    width: 10,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 72, 50, 0.82)',
    borderRadius: 6,
    zIndex: 2,
  },
  scrollHintPressed: {
    backgroundColor: 'rgba(18, 72, 50, 0.96)',
  },
  scrollHintLeft: {
    left: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  scrollHintRight: {
    right: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  scrollHintIcon: {
    color: '#f5c542',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: -1,
  },
});
