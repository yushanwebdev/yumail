import { ScrollView, StyleSheet, View } from 'react-native';
import { NavRail } from '@/components/NavRail';
import { InboxHeader } from '@/components/InboxHeader';
import { EmailRow } from '@/components/EmailRow';
import { emails } from '@/constants/emails';
import { colors, spacing } from '@/constants/theme';

export default function InboxScreen() {
  return (
    <View style={styles.shell}>
      <NavRail />
      <View style={styles.mainStage}>
        <InboxHeader />
        <ScrollView
          style={styles.emailList}
          contentContainerStyle={styles.emailListContent}
        >
          {emails.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.paper,
  },
  mainStage: {
    flex: 1,
    overflow: 'hidden',
  },
  emailList: {
    flex: 1,
  },
  emailListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
