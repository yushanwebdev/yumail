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

function extractEmail(from: string): { local: string; domain: string } {
  const match = from.match(/<(.+?)>$/);
  const addr = match ? match[1] : from;
  const atIndex = addr.indexOf("@");
  if (atIndex === -1) return { local: addr, domain: "" };
  return { local: addr.slice(0, atIndex), domain: addr.slice(atIndex) };
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

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#198754" />
    );
  }

  return (
    <LegendList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EmailRow
          email={item}
          onPress={() => router.push(`/email/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowContent: {
    flex: 1,
    gap: 2,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#C6C6C8",
    marginLeft: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
