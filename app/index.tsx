import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEmails } from '@/hooks/useEmails';
import type { Email } from '@/constants/emails';

function Avatar({ email }: { email: Email }) {
  const bg = email.unread ? '#D1E7DD' : '#E8E8ED';
  const color = email.unread ? '#198754' : '#8E8E93';

  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { color }]}>
        {email.sender.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function EmailRow({ email }: { email: Email }) {
  return (
    <View style={styles.row}>
      <Avatar email={email} />
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text
            style={[
              styles.sender,
              email.unread && styles.senderUnread,
            ]}
            numberOfLines={1}
          >
            {email.sender}
          </Text>
          <Text
            style={[
              styles.date,
              email.unread && styles.dateUnread,
            ]}
          >
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
    </View>
  );
}

export default function InboxScreen() {
  const [search, setSearch] = useState('');
  const { emails } = useEmails();

  const filtered = search
    ? emails.filter(
        (e) =>
          e.sender.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmailRow email={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#202646',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#202646',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    fontSize: 17,
    color: '#202646',
    flexShrink: 1,
  },
  senderUnread: {
    fontWeight: '600',
  },
  date: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 8,
  },
  dateUnread: {
    color: '#198754',
  },
  subject: {
    fontSize: 15,
    color: '#8E8E93',
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#198754',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 84,
  },
});
