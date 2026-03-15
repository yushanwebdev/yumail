import type { Email } from "@/constants/emails";
import { formatBucket, useEmails } from "@/hooks/useEmails";
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

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function groupByDate(emails: Email[]): ListItem[] {
  const groups: { bucket: string; createdAt: string; emails: Email[] }[] = [];
  const seen = new Map<string, number>();

  for (const email of emails) {
    const bucket = email.createdAt ? formatBucket(email.createdAt) : email.date;

    const idx = seen.get(bucket);
    if (idx !== undefined) {
      groups[idx].emails.push(email);
    } else {
      seen.set(bucket, groups.length);
      groups.push({ bucket, createdAt: email.createdAt ?? "", emails: [email] });
    }
  }

  const items: ListItem[] = [];
  for (const group of groups) {
    let title = group.bucket;
    if (group.createdAt) {
      const date = new Date(group.createdAt.replace(" ", "T").replace(/\+(\d{2})$/, "+$1:00"));
      if (!isNaN(date.getTime())) {
        title = `${group.bucket} · Day ${dayOfYear(date)}`;
      }
    }
    items.push({ type: "header", title });
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
      <View style={styles.headerBadge}>
        <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
      </View>
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
      <View style={styles.dotCol}>
        {email.unread && <View style={styles.unreadDot} />}
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

const DOT_COL_WIDTH = 20;

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F0F0F4",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C6C70",
    letterSpacing: 0.5,
  },
  dotCol: {
    width: DOT_COL_WIDTH,
    alignItems: "center",
    paddingTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#198754",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 20,
    paddingVertical: 12,
    marginLeft: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  rowPressed: {
    backgroundColor: "#F2F2F7",
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    fontSize: 16,
    color: "#202646",
    flexShrink: 1,
  },
  senderUnread: {
    fontWeight: "600",
  },
  senderDomain: {
    fontSize: 13,
    color: "#6C6C70",
    fontWeight: "400",
  },
  date: {
    fontSize: 14,
    color: "#6C6C70",
    marginLeft: 8,
    flexShrink: 0,
  },
  dateUnread: {
    color: "#198754",
  },
  subject: {
    fontSize: 14,
    color: "#6C6C70",
    lineHeight: 19,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
