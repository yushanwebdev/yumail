import type { Email } from "@/constants/emails";
import { useEmails } from "@/hooks/useEmails";
import { LegendList } from "@legendapp/list";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function Avatar({ email }: { email: Email }) {
  const bg = email.unread ? "#D1E7DD" : "#E8E8ED";
  const color = email.unread ? "#198754" : "#8E8E93";

  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { color }]}>
        {email.sender.charAt(0).toUpperCase()}
      </Text>
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar email={email} />
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text
            style={[styles.sender, email.unread && styles.senderUnread]}
            numberOfLines={1}
          >
            {email.sender}
          </Text>
          <Text style={[styles.date, email.unread && styles.dateUnread]}>
            {email.date}
          </Text>
        </View>
        <Text style={styles.subject} numberOfLines={2}>
          {email.subject}
        </Text>
      </View>
      {email.unread && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>1</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function InboxScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const { emails, loading, loadingMore, hasMore, fetchMore } = useEmails();

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

  const filtered = search
    ? emails.filter(
        (e) =>
          e.sender.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase()),
      )
    : emails;

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
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "600",
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
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#198754",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#C6C6C8",
    marginLeft: 84,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
