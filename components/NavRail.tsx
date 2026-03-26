import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type NavFolder = {
  label: string;
  active?: boolean;
  count?: number;
};

const folders: NavFolder[] = [
  { label: 'Inbox', active: true, count: 4 },
  { label: 'Sent' },
  { label: 'Drafts' },
  { label: 'Archive' },
];

const labels = ['Design', 'Finance', 'Personal'];

export function NavRail() {
  return (
    <View style={styles.container}>
      <View>
        <Pressable style={({ hovered }) => [styles.composeBtn, hovered && styles.composeBtnHover]}>
          <Text style={styles.composeBtnText}>Compose New</Text>
        </Pressable>

        <View style={styles.navGroup}>
          <Text style={styles.navLabel}>Folders</Text>
          {folders.map((folder) => (
            <Pressable
              key={folder.label}
              style={({ hovered }) => [styles.navItem, hovered && styles.navItemHover]}
            >
              <Text style={[styles.navItemText, folder.active && styles.navItemActive]}>
                {folder.label}
              </Text>
              {folder.count != null && <Text style={styles.count}>{folder.count}</Text>}
            </Pressable>
          ))}
        </View>

        <View style={styles.navGroup}>
          <Text style={styles.navLabel}>Labels</Text>
          {labels.map((label) => (
            <Pressable
              key={label}
              style={({ hovered }) => [styles.navItem, hovered && styles.navItemHover]}
            >
              <Text style={styles.navItemText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.logoMark}>MAIL*</Text>
        <Text style={styles.logoMark}>V.2.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  composeBtn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkPrimary,
    marginBottom: spacing.lg,
  },
  composeBtnHover: {
    paddingLeft: 5,
  },
  composeBtnText: {
    fontFamily: fonts.inter,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    color: colors.inkPrimary,
  },
  navGroup: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  navLabel: {
    fontFamily: fonts.inter,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.inkSecondary,
    marginBottom: spacing.sm,
    opacity: 0.7,
  },
  navItem: {
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItemHover: {
    opacity: 0.7,
  },
  navItemText: {
    fontFamily: fonts.playfairDisplay,
    fontSize: 18,
    color: colors.inkPrimary,
  },
  navItemActive: {
    fontStyle: 'italic',
    fontFamily: fonts.playfairDisplayItalic,
  },
  count: {
    fontFamily: fonts.inter,
    fontSize: 10,
    color: colors.inkSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  logoMark: {
    fontFamily: fonts.inter,
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.6,
    color: colors.inkPrimary,
  },
});
