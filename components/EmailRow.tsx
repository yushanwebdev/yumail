import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { useReadStatusStore } from '@/stores/useReadStatusStore';
import type { Email } from '@/constants/emails';

type EmailRowProps = {
  email: Email;
};

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[hashCode(name) % AVATAR_COLORS.length];
}

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();
  const isRead = useReadStatusStore((s) => s.readIds.includes(email.id));
  const toggleRead = useReadStatusStore((s) => s.toggleRead);

  const initial = email.sender.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(email.sender);

  return (
    <Pressable
      onPress={() => router.push(`/email/${email.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.senderName} numberOfLines={1}>
          {email.sender}
        </Text>
        <Text style={styles.dateText} numberOfLines={1}>
          {email.date}
          {email.subject ? ` · ${email.subject}` : ''}
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

const AVATAR_SIZE = 40;
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
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.utilitySemiBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    fontFamily: fonts.utilitySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateText: {
    fontFamily: fonts.utility,
    fontSize: 13,
    color: colors.textSecondary,
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
