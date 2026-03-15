import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';
import type { Email } from '@/constants/emails';

type EmailRowProps = {
  email: Email;
};

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/email/${email.id}`)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.topLine}>
        <View style={styles.senderRow}>
          {email.unread && <Text style={styles.statusDot}>*</Text>}
          <Text style={[styles.senderText, email.unread && styles.senderUnread]} numberOfLines={1}>
            {email.sender}
          </Text>
        </View>
        <Text style={styles.dateText}>{email.date}</Text>
      </View>
      <Text style={[styles.subject, !email.unread && styles.subjectRead]} numberOfLines={1}>
        {email.subject}
      </Text>
      <Text style={styles.snippet} numberOfLines={1}>
        {email.snippet}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.6,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statusDot: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.inkPrimary,
    lineHeight: 14,
  },
  senderText: {
    fontFamily: fonts.utility,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    color: colors.inkPrimary,
  },
  senderUnread: {
    fontFamily: fonts.utilitySemiBold,
    fontWeight: '600',
  },
  dateText: {
    fontFamily: fonts.utility,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.inkSecondary,
  },
  subject: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '400',
    color: colors.inkPrimary,
    marginBottom: 2,
  },
  subjectRead: {
    opacity: 0.8,
  },
  snippet: {
    fontFamily: fonts.utility,
    fontSize: 13,
    color: colors.inkSecondary,
  },
});
