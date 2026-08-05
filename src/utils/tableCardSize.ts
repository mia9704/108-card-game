import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type TableCardMetrics = {
  width: number;
  height: number;
  padding: number;
  borderRadius: number;
  rankSize: number;
  suitSize: number;
  hintSize: number;
  calledSuitSize: number;
  backPatternSize: number;
  overlap: number;
};

export type TableLayout = {
  cardMetrics: TableCardMetrics;
  sideSeatWidth: number;
  sidePlayerWidth: number;
  pileGap: number;
  sideInset: number;
  isCompact: boolean;
};

export type ScreenLayout = {
  width: number;
  height: number;
  sideInset: number;
  pileGap: number;
};

type SizeSpec = TableCardMetrics;

const STANDARD: SizeSpec = {
  width: 72,
  height: 104,
  padding: 8,
  borderRadius: 10,
  rankSize: 18,
  suitSize: 24,
  hintSize: 9,
  calledSuitSize: 11,
  backPatternSize: 12,
  overlap: 36,
};

const LARGE: SizeSpec = {
  width: 96,
  height: 138,
  padding: 10,
  borderRadius: 12,
  rankSize: 22,
  suitSize: 30,
  hintSize: 10,
  calledSuitSize: 12,
  backPatternSize: 14,
  overlap: 48,
};

function lerpSize(from: SizeSpec, to: SizeSpec, t: number): TableCardMetrics {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);

  return {
    width: mix(from.width, to.width),
    height: mix(from.height, to.height),
    padding: mix(from.padding, to.padding),
    borderRadius: mix(from.borderRadius, to.borderRadius),
    rankSize: mix(from.rankSize, to.rankSize),
    suitSize: mix(from.suitSize, to.suitSize),
    hintSize: mix(from.hintSize, to.hintSize),
    calledSuitSize: mix(from.calledSuitSize, to.calledSuitSize),
    backPatternSize: mix(from.backPatternSize, to.backPatternSize),
    overlap: mix(from.overlap, to.overlap),
  };
}

function getCompactLayout(): TableLayout {
  return {
    cardMetrics: STANDARD,
    sideSeatWidth: 32,
    sidePlayerWidth: 36,
    pileGap: 8,
    sideInset: 0.025,
    isCompact: true,
  };
}

export function getTableCardMetrics(screenWidth: number): TableCardMetrics {
  if (screenWidth >= 1280) {
    return LARGE;
  }
  if (screenWidth >= 768) {
    return lerpSize(STANDARD, LARGE, (screenWidth - 768) / (1280 - 768));
  }
  return STANDARD;
}

export function getTableLayout(screenWidth: number, _screenHeight: number): TableLayout {
  if (screenWidth < 768) {
    return getCompactLayout();
  }

  return {
    cardMetrics: getTableCardMetrics(screenWidth),
    sideSeatWidth: 92,
    sidePlayerWidth: 56,
    pileGap: 24,
    sideInset: 0.13,
    isCompact: false,
  };
}

export function toScreenLayout(layout: TableLayout, screenWidth: number, screenHeight: number): ScreenLayout {
  return {
    width: screenWidth,
    height: screenHeight,
    sideInset: layout.sideInset,
    pileGap: layout.pileGap,
  };
}

export function useTableLayout(): TableLayout & ScreenLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const layout = getTableLayout(width, height);
    return {
      ...layout,
      ...toScreenLayout(layout, width, height),
    };
  }, [width, height]);
}

export function useTableCardMetrics(): TableCardMetrics {
  const { cardMetrics } = useTableLayout();
  return cardMetrics;
}
