import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii } from '@/constants/theme';
import { toggleRead } from '@/db/emailQueries';
import type { Email } from '@/constants/emails';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EmailRowProps = {
  email: Email;
};

function extractEmail(from: string): string {
  const match = from.match(/<(.+)>/);
  return match ? match[1] : from;
}

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();
  const isRead = !email.unread;
  const scale = useSharedValue(1);

  const fullEmail = extractEmail(email.from);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push(`/email/${email.id}`);
      }}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 200 });
      }}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.subject, isRead && styles.subjectRead]}
          numberOfLines={1}
        >
          {email.subject || '(No subject)'}
        </Text>
        <Text style={styles.senderLine} numberOfLines={1}>
          {fullEmail}{email.date ? ` · ${email.date}` : ''}
        </Text>
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          toggleRead(email.id);
        }}
        hitSlop={8}
        style={styles.checkArea}
      >
        <View style={[styles.circle, isRead && styles.circleFilled]}>
          {isRead && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>
    </AnimatedPressable>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  subject: {
    fontFamily: fonts.interSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subjectRead: {
    fontFamily: fonts.interMedium,
  },
  senderLine: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkArea: {
    padding: 4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFilled: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 14,
  },
});
