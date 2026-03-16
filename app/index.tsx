import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import type { Email } from '@/constants/emails';
import { useEmails } from '@/hooks/useEmails';
import { useReadStatusStore } from '@/stores/useReadStatusStore';
import { colors } from '@/constants/theme';
import { EmailRow } from '@/components/EmailRow';
import { ProgressHeader } from '@/components/planner/ProgressHeader';
import { DayHeader } from '@/components/planner/DayHeader';
import { WeekDayPicker } from '@/components/planner/WeekDayPicker';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseEmailDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const normalized = dateStr
    .replace(' ', 'T')
    .replace(/\+(\d{2})$/, '+$1:00')
    .replace(/-(\d{2})$/, '-$1:00');
  const ts = Date.parse(normalized);
  if (!isNaN(ts)) return new Date(ts);
  return null;
}

function emailMatchesDate(email: Email, selected: Date): boolean {
  // API emails have createdAt — compare calendar day
  if (email.createdAt) {
    const emailDate = parseEmailDate(email.createdAt);
    if (emailDate) return isSameDay(emailDate, selected);
  }

  // Mock emails only have display strings like "10:42 AM", "Yesterday", "Jun 12"
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

  const d = email.date;
  if (d.includes('AM') || d.includes('PM')) {
    // Time-only means today
    return selectedDay.getTime() === today.getTime();
  }
  if (d === 'Yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return selectedDay.getTime() === yesterday.getTime();
  }
  // "Jun 12" style — parse with current year
  const parsed = new Date(`${d}, ${now.getFullYear()}`);
  if (!isNaN(parsed.getTime())) {
    return isSameDay(parsed, selected);
  }

  return false;
}

function filterByDate(emails: Email[], selected: Date): Email[] {
  return emails.filter((e) => emailMatchesDate(e, selected));
}

function ListHeader({
  selectedDate,
  onSelectDate,
  readCount,
  totalCount,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  readCount: number;
  totalCount: number;
}) {
  return (
    <View>
      <ProgressHeader readCount={readCount} totalCount={totalCount} />
      <DayHeader date={selectedDate} />
      <WeekDayPicker selectedDate={selectedDate} onSelectDate={onSelectDate} />
    </View>
  );
}

export default function InboxScreen() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { emails, loading, refreshing, loadingMore, hasMore, refetch, fetchMore } =
    useEmails();
  const readIds = useReadStatusStore((s) => s.readIds);

  const emailsWithReadStatus = useMemo(
    () => emails.map((e) => ({ ...e, unread: !readIds.includes(e.id) })),
    [emails, readIds],
  );

  const filtered = useMemo(
    () => filterByDate(emailsWithReadStatus, selectedDate),
    [emailsWithReadStatus, selectedDate],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LegendList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmailRow email={item} />}
        ListHeaderComponent={
          <ListHeader
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            readCount={filtered.filter((e) => !e.unread).length}
            totalCount={filtered.length}
          />
        }
        estimatedItemSize={72}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && hasMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={colors.textSecondary}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            tintColor={colors.textSecondary}
          />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        recycleItems
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
