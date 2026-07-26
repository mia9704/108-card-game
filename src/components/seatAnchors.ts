import { Dimensions } from 'react-native';
import { SeatPosition } from '../game/types';

const { width, height } = Dimensions.get('window');

export function getSeatAnchor(seat: SeatPosition): { x: number; y: number } {
  switch (seat) {
    case 'bottom':
      return { x: width * 0.5, y: height * 0.76 };
    case 'top':
      return { x: width * 0.5, y: height * 0.24 };
    case 'left':
      return { x: width * 0.13, y: height * 0.44 };
    case 'right':
      return { x: width * 0.87, y: height * 0.44 };
  }
}

export function getDiscardAnchor(): { x: number; y: number } {
  return { x: width * 0.5, y: height * 0.44 };
}

export function getDrawPileAnchor(cardWidth = 72): { x: number; y: number } {
  return { x: width * 0.5 + cardWidth * 0.85 + 24, y: height * 0.44 };
}
