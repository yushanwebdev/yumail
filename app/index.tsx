import type { Email } from "@/constants/emails";
import { useEmails } from "@/hooks/useEmails";
import { useReadStatusStore } from "@/stores/useReadStatusStore";
import { LegendList } from "@legendapp/list";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ListItem =
  | { type: "header"; title: string }
  | { type: "email"; email: Email };

function groupByDate(emails: Email[]): ListItem[] {
  const groups: { title: string; emails: Email[] }[] = [];
  const seen = new Map<string, number>();

  for (const email of emails) {
    let bucket: string;
    if (/AM|PM/i.test(email.date)) {
      bucket = "Today";
    } else if (email.date === "Yesterday") {
      bucket = "Yesterday";
    } else {
      bucket = email.date;
    }

    const idx = seen.get(bucket);
    if (idx !== undefined) {
      groups[idx].emails.push(email);
    } else {
      seen.set(bucket, groups.length);
      groups.push({ title: bucket, emails: [email] });
    }
  }

  const items: ListItem[] = [];
  for (const group of groups) {
    items.push({ type: "header", title: group.title });
    for (const email of group.emails) {
      items.push({ type: "email", email });
    }
  }
  return items;
}

function extractEmail(from: string): { local: string; domain: string } {
  const match = from.match(/<(.+?)>$/);
  const addr = match ? match[1] : from;
  const atIndex = addr.indexOf("@");
  if (atIndex === -1) return { local: addr, domain: "" };
  return { local: addr.slice(0, atIndex), domain: addr.slice(atIndex) };
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLine} />
      <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
      <View style={styles.headerLine} />
    </View>
  );
}

function EmailRow({
  email,
  onPress,
}: {
  email: Email;
  onPress: () => void;
}) {
  const { local, domain } = extractEmail(email.from);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.timelineCol}>
        <View style={styles.timelineLine} />
        <View
          style={[
            styles.dot,
            email.unread ? styles.dotUnread : styles.dotRead,
          ]}
        />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text
            style={[styles.sender, email.unread && styles.senderUnread]}
            numberOfLines={1}
          >
            {local}
            <Text style={styles.senderDomain}>{domain}</Text>
          </Text>
          <Text style={[styles.date, email.unread && styles.dateUnread]}>
            {email.date}
          </Text>
        </View>
        <Text style={styles.subject} numberOfLines={2}>
          {email.subject}
        </Text>
      </View>
    </Pressable>
  );
}

export default function InboxScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const { emails, loading, loadingMore, hasMore, fetchMore } = useEmails();
  const readIds = useReadStatusStore((s) => s.readIds);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Inbox",
      headerLargeTitle: true,
      headerLargeTitleStyle: {
        color: "#202646",
      },
      headerTintColor: "#202646",
      headerShadowVisible: false,
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (event: { nativeEvent: { text: string } }) => {
          setSearch(event.nativeEvent.text);
        },
        onCancelButtonPress: () => setSearch(""),
      },
      headerBackVisible: false,
    });
  }, [navigation]);

  const emailsWithReadStatus = useMemo(
    () => emails.map((e) => ({ ...e, unread: !readIds.includes(e.id) })),
    [emails, readIds],
  );

  const filtered = search
    ? emailsWithReadStatus.filter(
        (e) =>
          e.sender.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase()),
      )
    : emailsWithReadStatus;

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#198754" />
    );
  }

  return (
    <LegendList
      data={grouped}
      keyExtractor={(item) =>
        item.type === "header" ? `header-${item.title}` : item.email.id
      }
      getItemType={(item) => item.type}
      renderItem={({ item }) => {
        if (item.type === "header") {
          return <SectionHeader title={item.title} />;
        }
        return (
          <EmailRow
            email={item.email}
            onPress={() => router.push(`/email/${item.email.id}`)}
          />
        );
      }}
      estimatedItemSize={80}
      onEndReached={!search ? fetchMore : undefined}
      onEndReachedThreshold={0.5}
      contentInsetAdjustmentBehavior="automatic"
      ListFooterComponent={
        loadingMore && hasMore ? (
          <ActivityIndicator
            style={styles.footerLoader}
            size="small"
            color="#198754"
          />
        ) : null
      }
      recycleItems
    />
  );
}

const TIMELINE_WIDTH = 28;
const DOT_SIZE = 8;
const LINE_WIDTH = 1.5;

const styles = StyleSheet.create({
  timelineCol: {
    width: TIMELINE_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  timelineLine: {
    position: "absolute",
    top: -10,
    bottom: -10,
    width: LINE_WIDTH,
    backgroundColor: "#D1D1D6",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotUnread: {
    backgroundColor: "#198754",
  },
  dotRead: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C6C6C8",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D1D6",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingRight: 20,
    paddingLeft: 16,
    paddingVertical: 10,
    overflow: "hidden",
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowContent: {
    flex: 1,
    gap: 2,
    marginLeft: 10,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    fontSize: 17,
    color: "#202646",
    flexShrink: 1,
  },
  senderUnread: {
    fontWeight: "600",
  },
  senderDomain: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "400",
  },
  date: {
    fontSize: 15,
    color: "#8E8E93",
    marginLeft: 8,
  },
  dateUnread: {
    color: "#198754",
  },
  subject: {
    fontSize: 15,
    color: "#8E8E93",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
