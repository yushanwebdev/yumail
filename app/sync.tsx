import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSync } from '@/hooks/useSync';
import { colors, fonts, spacing } from '@/constants/theme';

export default function SyncScreen() {
  const { phase, emailsFetched, error, retry } = useSync();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Yumail</Text>
        <Text style={styles.subtitle}>Setting up your inbox</Text>

        <View style={styles.statusContainer}>
          {phase === 'error' ? (
            <>
              <Text style={styles.errorText}>{error ?? 'Something went wrong'}</Text>
              <Pressable style={styles.retryButton} onPress={retry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator size="small" color={colors.inkPrimary} />
              <Text style={styles.progressText}>
                {phase === 'migrating'
                  ? 'Finishing up…'
                  : `Syncing emails… ${emailsFetched} fetched`}
              </Text>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.playfairDisplay,
    fontSize: 48,
    color: colors.inkPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: '#C23B22',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.inkPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: fonts.interMedium,
    fontSize: 14,
    color: colors.paper,
  },
});
