import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { useReadStatusStore } from '@/stores/useReadStatusStore';
import type { Email } from '@/constants/emails';

type EmailRowProps = {
  email: Email;
};

function extractEmail(from: string): string {
  const match = from.match(/<(.+)>/);
  return match ? match[1] : from;
}

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();
  const isRead = useReadStatusStore((s) => s.readIds.includes(email.id));
  const toggleRead = useReadStatusStore((s) => s.toggleRead);

  const fullEmail = extractEmail(email.from);
  const atIndex = fullEmail.indexOf('@');

  return (
    <Pressable
      onPress={() => router.push(`/email/${email.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.content}>
        <Text style={styles.subject} numberOfLines={1}>
          {email.subject || '(No subject)'}
        </Text>
        <Text style={styles.senderLine} numberOfLines={1}>
          {atIndex > 0 ? fullEmail.slice(0, atIndex) : fullEmail}
          {atIndex > 0 && (
            <Text style={styles.senderDomain}>{fullEmail.slice(atIndex)}</Text>
          )}
          {email.date ? ` · ${email.date}` : ''}
        </Text>
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          toggleRead(email.id);
        }}
        hitSlop={8}
        style={styles.checkArea}
      >
        <View style={[styles.circle, isRead && styles.circleFilled]}>
          {isRead && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>
    </Pressable>
  );
}

const CIRCLE_SIZE = 24;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  subject: {
    fontFamily: fonts.utilitySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  senderLine: {
    fontFamily: fonts.utility,
    fontSize: 13,
    color: colors.textSecondary,
  },
  senderDomain: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fonts.utility,
  },
  checkArea: {
    padding: 4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFilled: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  checkmark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 15,
  },
});
