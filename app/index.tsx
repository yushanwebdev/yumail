import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InboxHeader } from '@/components/InboxHeader';
import { EmailRow } from '@/components/EmailRow';
import { emails } from '@/constants/emails';
import { colors, fonts, spacing } from '@/constants/theme';

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.logoMark}>MAIL*</Text>
          <Text style={styles.versionMark}>V.2.0</Text>
        </View>
        <Pressable style={styles.composeBtn}>
          <Text style={styles.composeBtnText}>Compose</Text>
        </Pressable>
      </View>
      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={InboxHeader}
        renderItem={({ item }) => <EmailRow email={item} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoMark: {
    fontFamily: fonts.utility,
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkPrimary,
    opacity: 0.6,
  },
  versionMark: {
    fontFamily: fonts.utility,
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkPrimary,
    opacity: 0.4,
  },
  composeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkPrimary,
  },
  composeBtnText: {
    fontFamily: fonts.utility,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    color: colors.inkPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
});
