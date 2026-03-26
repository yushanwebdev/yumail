import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

export function InboxHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Primary Account</Text>
        <Text style={styles.metaText}>London, UK</Text>
        <Text style={styles.metaText}>June 14, 2024</Text>
      </View>
      <Text style={styles.title}>
        {'Inbox* — A collection\nof urgent matters.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.paper,
    zIndex: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.inkPrimary,
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    fontFamily: fonts.inter,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
    color: colors.inkSecondary,
  },
  title: {
    fontFamily: fonts.playfairDisplay,
    fontSize: 64,
    fontWeight: '400',
    lineHeight: 64 * 0.9,
    letterSpacing: -0.02 * 64,
    color: colors.inkPrimary,
    maxWidth: 600,
  },
});
