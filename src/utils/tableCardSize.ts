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

type SizeSpec = TableCardMetrics;

const COMPACT: SizeSpec = {
  width: 44,
  height: 64,
  padding: 4,
  borderRadius: 8,
  rankSize: 11,
  suitSize: 14,
  hintSize: 7,
  calledSuitSize: 9,
  backPatternSize: 10,
  overlap: 36,
};

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

export function getTableCardMetrics(screenWidth: number): TableCardMetrics {
  if (screenWidth <= 480) {
    return COMPACT;
  }
  if (screenWidth >= 1280) {
    return LARGE;
  }
  if (screenWidth <= 768) {
    return lerpSize(COMPACT, STANDARD, (screenWidth - 480) / (768 - 480));
  }
  return lerpSize(STANDARD, LARGE, (screenWidth - 768) / (1280 - 768));
}

export function useTableCardMetrics(): TableCardMetrics {
  const { width } = useWindowDimensions();
  return useMemo(() => getTableCardMetrics(width), [width]);
}
