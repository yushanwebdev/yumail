import { useEmailDetail } from '@/hooks/useEmailDetail';
import { useReadStatusStore } from '@/stores/useReadStatusStore';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import WebView from 'react-native-webview';

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
}

function extractSenderEmail(from: string): string {
  const match = from.match(/<(.+?)>$/);
  return match ? match[1] : from;
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const normalized = dateStr
    .replace(' ', 'T')
    .replace(/\+(\d{2})$/, '+$1:00')
    .replace(/-(\d{2})$/, '-$1:00');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${h}:${m} ${ampm}`;
}

function Avatar({ name }: { name: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function RecipientLine({ label, addresses }: { label: string; addresses: string[] }) {
  if (!addresses || addresses.length === 0) return null;
  return (
    <Text style={styles.metaText}>
      <Text style={styles.metaLabel}>{label}: </Text>
      {addresses.join(', ')}
    </Text>
  );
}

export default function EmailDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { email, loading, error } = useEmailDetail(id);
  const { width } = useWindowDimensions();
  const [webViewHeight, setWebViewHeight] = useState(300);

  const markAsRead = useReadStatusStore((s) => s.markAsRead);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerBackTitle: 'Inbox',
      headerTintColor: '#202646',
      headerShadowVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (email && id) {
      markAsRead(id);
    }
  }, [email, id, markAsRead]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#000000" />;
  }

  if (error || !email) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load email</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  const senderName = extractSenderName(email.from);
  const senderEmail = extractSenderEmail(email.from);
  const bodyContent = email.text || '';
  const hasHtml = !!email.html;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.subject}>{email.subject || '(No subject)'}</Text>

      <View style={styles.senderRow}>
        <Avatar name={senderName} />
        <View style={styles.senderInfo}>
          <View style={styles.senderNameRow}>
            <Text style={styles.senderName}>{senderName}</Text>
            <Text style={styles.dateText}>{formatFullDate(email.created_at)}</Text>
          </View>
          <Text style={styles.senderEmail}>{senderEmail}</Text>
          <RecipientLine label="To" addresses={email.to} />
          {email.cc.length > 0 && <RecipientLine label="Cc" addresses={email.cc} />}
        </View>
      </View>

      <View style={styles.divider} />

      {hasHtml && Platform.OS !== 'web' ? (
        <WebView
          originWhitelist={['*']}
          source={{
            html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0"><style>body{margin:0;padding:0;font-family:-apple-system,system-ui,sans-serif;font-size:16px;color:#202646;word-break:break-word;overflow-x:auto}img{max-width:100%;height:auto}table{max-width:none}</style></head><body>${email.html}</body></html>`,
          }}
          style={{ width: width - 32, height: webViewHeight }}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={false}
          onMessage={(event) => {
            const h = Number(event.nativeEvent.data);
            if (h > 0) setWebViewHeight(h);
          }}
          injectedJavaScript="(function(){var last=0;function post(){var h=document.body.scrollHeight;if(h!==last){last=h;window.ReactNativeWebView.postMessage(String(h))}}if(window.ResizeObserver){new ResizeObserver(post).observe(document.body)}else{new MutationObserver(post).observe(document.body,{childList:true,subtree:true,attributes:true});setInterval(post,500)}document.addEventListener('load',post,true);post()})();true;"
        />
      ) : hasHtml && Platform.OS === 'web' ? (
        <iframe
          sandbox="allow-same-origin"
          srcDoc={email.html}
          // @ts-ignore - iframe is valid on web
          style={{
            width: '100%',
            minHeight: 600,
            border: 'none',
          }}
        />
      ) : (
        <Text style={styles.bodyText} selectable>
          {bodyContent}
        </Text>
      )}

      {email.attachments.length > 0 && (
        <View style={styles.attachmentsSection}>
          <Text style={styles.attachmentsTitle}>
            Attachments ({email.attachments.length})
          </Text>
          {email.attachments.map((att) => (
            <View key={att.id} style={styles.attachmentRow}>
              <Text style={styles.attachmentName}>{att.filename}</Text>
              <Text style={styles.attachmentSize}>
                {(att.size / 1024).toFixed(1)} KB
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#202646',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 15,
    color: '#8E8E93',
  },
  subject: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202646',
    marginBottom: 16,
  },
  senderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  senderInfo: {
    flex: 1,
    gap: 2,
  },
  senderNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202646',
  },
  senderEmail: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metaText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metaLabel: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#202646',
  },
  attachmentsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  attachmentsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202646',
    marginBottom: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: '#202646',
    flex: 1,
  },
  attachmentSize: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
});
