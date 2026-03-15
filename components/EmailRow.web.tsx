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
      style={({ hovered }) => [
        styles.row,
        hovered && styles.rowHover,
      ]}
    >
      {({ hovered }) => (
        <>
          <View style={styles.colStatus}>
            <Text style={[styles.statusDot, !email.unread && styles.statusDotRead]}>*</Text>
          </View>
          <View style={styles.colSender}>
            <Text style={[styles.senderText, email.unread && styles.senderUnread]} numberOfLines={1}>
              {email.sender}
            </Text>
          </View>
          <View style={styles.colContent}>
            <Text numberOfLines={1}>
              <Text style={[styles.subject, !email.unread && styles.subjectRead, hovered && styles.subjectHover]}>
                {email.subject}
              </Text>
              <Text style={styles.snippet}> {email.snippet}</Text>
            </Text>
          </View>
          <View style={styles.colDate}>
            <Text style={styles.dateText}>{email.date}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  rowHover: {
    borderBottomColor: colors.divider,
  },
  colStatus: {
    width: 24,
  },
  statusDot: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.inkPrimary,
    lineHeight: 16,
  },
  statusDotRead: {
    opacity: 0,
  },
  colSender: {
    width: 200,
    paddingRight: spacing.md,
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
  colContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  subject: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '400',
    color: colors.inkPrimary,
  },
  subjectRead: {
    opacity: 0.8,
  },
  subjectHover: {
    color: colors.accentBlue,
  },
  snippet: {
    fontFamily: fonts.utility,
    fontSize: 13,
    color: colors.inkSecondary,
    fontWeight: '400',
  },
  colDate: {
    width: 100,
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: fonts.utility,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.inkSecondary,
  },
});
