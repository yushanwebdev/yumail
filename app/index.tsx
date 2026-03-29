import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { useEmailsFromDb } from '@/hooks/useEmailsFromDb';
import { colors } from '@/constants/theme';
import { EmailRow } from '@/components/EmailRow';
import { ProgressHeader } from '@/components/ProgressHeader';
import { DayHeader } from '@/components/DayHeader';
import { WeekDayPicker } from '@/components/WeekDayPicker';

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
  const { emails, loading, refreshing, total, readCount, refetch } =
    useEmailsFromDb(selectedDate);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LegendList
        data={emails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmailRow email={item} />}
        ListHeaderComponent={
          <ListHeader
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            readCount={readCount}
            totalCount={total}
          />
        }
        estimatedItemSize={72}
        ListFooterComponent={
          loading ? (
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
