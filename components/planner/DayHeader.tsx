import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

type DayHeaderProps = {
  date: Date;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function DayHeader({ date }: DayHeaderProps) {
  const dayName = DAYS[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  const dayOfMonth = ordinal(date.getDate());
  const year = date.getFullYear();

  return (
    <View style={styles.container}>
      <Text style={styles.dayName}>{dayName}</Text>
      <Text style={styles.dateSubtitle}>
        {monthName} {dayOfMonth}, {year}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  dateSubtitle: {
    fontFamily: fonts.utility,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
