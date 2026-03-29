import { Alert } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportDatabase(): Promise<void> {
  const dbFile = new File(Paths.document, 'SQLite', 'yumail.db');

  if (!dbFile.exists) {
    Alert.alert('Export Error', 'No database found to export.');
    return;
  }

  Alert.alert(
    'Export Database',
    'This file contains your email data. Share it only with trusted recipients.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const exportName = `yumail-export-${Date.now()}.db`;
            const exportFile = new File(Paths.cache, exportName);
            dbFile.copy(exportFile);

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(exportFile.uri, {
                mimeType: 'application/x-sqlite3',
                dialogTitle: 'Export Yumail Database',
              });
            } else {
              Alert.alert('Error', 'Sharing is not available on this device.');
            }
          } catch (e) {
            Alert.alert('Export Error', e instanceof Error ? e.message : 'Export failed');
          }
        },
      },
    ],
  );
}
