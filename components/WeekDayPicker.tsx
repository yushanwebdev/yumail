import { colors, fonts } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type WeekDayPickerProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeekDayPicker({
  selectedDate,
  onSelectDate,
}: WeekDayPickerProps) {
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const handleSelect = useCallback(
    (date: Date) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectDate(date);
    },
    [onSelectDate],
  );

  const shiftWeek = useCallback(
    (direction: -1 | 1) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + direction * 7);
      onSelectDate(next);
    },
    [selectedDate, onSelectDate],
  );

  return (
    <View>
      <View style={styles.container}>
        <Pressable onPress={() => shiftWeek(-1)} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        {days.map((day, i) => {
          const selected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <Pressable
              key={i}
              onPress={() => handleSelect(day)}
              style={styles.dayColumn}
            >
              <Text
                style={[styles.dayLabel, selected && styles.dayLabelSelected]}
              >
                {DAY_LABELS[i]}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  isToday && !selected && styles.dayCircleToday,
                  selected && styles.dayCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
        <Pressable onPress={() => shiftWeek(1)} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 2,
  },
  arrow: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 22,
    color: colors.textSecondary,
    fontFamily: fonts.inter,
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  dayLabel: {
    fontFamily: fonts.inter,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  dayLabelSelected: {
    color: colors.textPrimary,
    fontFamily: fonts.interSemiBold,
  },
  dayCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.unselectedDay,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.selectedDay,
  },
  dayCircleSelected: {
    backgroundColor: colors.selectedDay,
  },
  dayNumber: {
    fontFamily: fonts.interMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: "#FFFFFF",
  },
});
