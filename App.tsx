import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <LanguageProvider>
      <GameScreen />
      <StatusBar style="light" />
    </LanguageProvider>
  );
}
