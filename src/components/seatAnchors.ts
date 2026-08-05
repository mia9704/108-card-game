import { Dimensions } from 'react-native';
import { SeatPosition } from '../game/types';
import { ScreenLayout } from '../utils/tableCardSize';

const { width, height } = Dimensions.get('window');

function resolveLayout(layout?: ScreenLayout) {
  return {
    width: layout?.width ?? width,
    height: layout?.height ?? height,
    sideInset: layout?.sideInset ?? (width < 768 ? 0.035 : 0.13),
    pileGap: layout?.pileGap ?? (width < 768 ? 10 : 24),
  };
}

export function getSeatAnchor(seat: SeatPosition, layout?: ScreenLayout): { x: number; y: number } {
  const { width: w, height: h, sideInset } = resolveLayout(layout);

  switch (seat) {
    case 'bottom':
      return { x: w * 0.5, y: h * 0.76 };
    case 'top':
      return { x: w * 0.5, y: h * (layout && layout.width < 768 ? 0.22 : 0.24) };
    case 'left':
      return { x: w * sideInset, y: h * 0.44 };
    case 'right':
      return { x: w * (1 - sideInset), y: h * 0.44 };
  }
}

export function getDiscardAnchor(layout?: ScreenLayout): { x: number; y: number } {
  const { width: w, height: h } = resolveLayout(layout);
  return { x: w * 0.5, y: h * 0.44 };
}

export function getDrawPileAnchor(
  cardWidth = 72,
  layout?: ScreenLayout,
): { x: number; y: number } {
  const { width: w, height: h, pileGap } = resolveLayout(layout);
  return { x: w * 0.5 + cardWidth * 0.85 + pileGap, y: h * 0.44 };
}
