import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';

type ProgressHeaderProps = {
  readCount: number;
  totalCount: number;
};

export function ProgressHeader({ readCount, totalCount }: ProgressHeaderProps) {

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.countText}>
          {readCount} / {totalCount}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.iconButton}>
          <Text style={styles.iconText}>···</Text>
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Text style={styles.iconText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emoji: {
    fontSize: 16,
  },
  countText: {
    fontFamily: fonts.utilitySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: fonts.utilitySemiBold,
    lineHeight: 20,
  },
});
