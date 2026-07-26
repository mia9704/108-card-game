import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type RulesHelpOverlayProps = {
  onClose: () => void;
};

const SECTIONS = [
  {
    title: 'Overview',
    body: [
      '4 players (you + 3 opponents), clockwise turn order.',
      '32-card deck: A, K, Q, J, 10, 9, 8, 7 — every card is unique.',
      '5 cards dealt to each player at the start of every round.',
      'Lowest cumulative score wins the match.',
    ],
  },
  {
    title: 'Playing cards',
    body: [
      'Match the top card by rank or suit.',
      'Play several cards at once if they are all the same rank.',
      'Queens are wild — play them on any card, then choose a suit. The called suit is shown under the Queen on the table.',
      'On your turn you may draw from the deck even if you have a playable card.',
      'After drawing, you may play a card or pass.',
    ],
  },
  {
    title: 'Declare one left',
    body: [
      'Press Declare when you have one card left, or several cards that are all the same rank.',
      'You can declare at any time during a round once you qualify.',
      'If you forget to declare before your next turn, you draw 1 as a penalty.',
      'You cannot go out without declaring first.',
    ],
  },
  {
    title: 'Special cards',
    body: [
      '7 — Start a 7-chain. Each seven played adds to the chain. The next player must play 7s or draw 7 × (total sevens in the chain). After a penalty draw, they may still play or pass.',
      'Ace — Playing N aces skips the next N players. Each skipped player may play aces (resetting the skip count to however many they played) or accept the skip.',
      'Queen — Going out with a Queen costs you 30 points per Queen in that final play (bonus for the round winner).',
    ],
  },
  {
    title: 'Scoring',
    body: [
      '7 = 0 · 8 = 8 · 9 = 9 · 10 = 10 · Jack = 2 · Queen = 30 · King = 4 · Ace = 11',
      'When someone goes out, everyone else adds up the points in their hand.',
      'Round winner gets −30 points for each Queen in their winning play.',
      'If your total score reaches exactly 108, it resets to 54.',
      'The match ends when any player goes over 108; lowest score wins.',
    ],
  },
];

export function RulesHelpOverlay({ onClose }: RulesHelpOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>How to Play</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.body.map((line) => (
                <Text key={line} style={styles.bullet}>
                  {'\u2022 '}
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
    padding: 20,
  },
  panel: {
    backgroundColor: '#fffef8',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a5c42',
    marginBottom: 12,
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c2833',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1a5c42',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f7f3e8',
    fontSize: 16,
    fontWeight: '700',
  },
});
