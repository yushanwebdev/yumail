import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

export function InboxHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Primary Account</Text>
        <Text style={styles.metaText}>June 14, 2024</Text>
      </View>
      <Text style={styles.title}>
        {'Inbox* —\nA collection\nof urgent\nmatters.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.inkPrimary,
    paddingTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontFamily: fonts.utility,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
    color: colors.inkSecondary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: '400',
    lineHeight: 40 * 0.95,
    letterSpacing: -0.02 * 40,
    color: colors.inkPrimary,
  },
});
