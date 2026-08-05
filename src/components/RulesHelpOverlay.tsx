import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n/LanguageContext';
import { RULES_SECTIONS } from '../i18n/translations';

type RulesHelpOverlayProps = {
  onClose: () => void;
};

export function RulesHelpOverlay({ onClose }: RulesHelpOverlayProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>{t('ui.howToPlay')}</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {RULES_SECTIONS.map((section) => (
            <View key={section.titleKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
              {section.bodyKeys.map((lineKey) => (
                <Text key={lineKey} style={styles.bullet}>
                  {'\u2022 '}
                  {t(lineKey)}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText} pointerEvents="none">
            {t('ui.close')}
          </Text>
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
    color: '#1c2833',
    textAlign: 'center',
    marginBottom: 12,
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
    color: '#1a5c42',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#f5c542',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    color: '#1c2833',
    fontSize: 16,
  },
});
