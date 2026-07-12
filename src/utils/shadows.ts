import { Platform, ViewStyle } from 'react-native';

type CardShadowOptions = {
  opacity: number;
  radius: number;
  offsetY: number;
  elevation: number;
};

export function cardShadow({
  opacity,
  radius,
  offsetY,
  elevation,
}: CardShadowOptions): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }

  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    elevation,
  };
}
