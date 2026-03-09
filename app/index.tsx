import { useState } from 'react';
import { PlatformColor } from 'react-native';
import {
  Host,
  List,
  HStack,
  VStack,
  Text,
  Image,
  Spacer,
  ZStack,
  TextField,
} from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  lineLimit,
  listStyle,
  listRowSeparator,
  frame,
  background,
  padding,
  textFieldStyle,
} from '@expo/ui/swift-ui/modifiers';
import { emails } from '@/constants/emails';

export default function InboxScreen() {
  const [search, setSearch] = useState('');

  const filtered = search
    ? emails.filter(
        (e) =>
          e.sender.toLowerCase().includes(search.toLowerCase()) ||
          e.subject.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  return (
    <Host style={{ flex: 1, backgroundColor: PlatformColor('systemBackground') }}>
      <List
        modifiers={[
          listStyle('plain'),
        ]}
      >
        {/* Header */}
        <VStack
          alignment="leading"
          spacing={8}
          modifiers={[
            listRowSeparator('hidden'),
            padding({ top: 8, bottom: 4 }),
          ]}
        >
          <Text
            modifiers={[
              font({ size: 34, weight: 'bold' }),
              foregroundStyle('primary'),
            ]}
          >
            Inbox
          </Text>
          <HStack
            spacing={6}
            modifiers={[
              frame({ maxWidth: Infinity }),
              padding({ horizontal: 12, vertical: 10 }),
              background(PlatformColor('tertiarySystemFill'), { shape: 'roundedRectangle', cornerRadius: 12 }),
            ]}
          >
            <Image
              systemName="magnifyingglass"
              size={15}
              color={PlatformColor('placeholderText')}
            />
            <TextField
              placeholder="Search emails"
              defaultValue=""
              onChangeText={setSearch}
              modifiers={[
                font({ size: 16 }),
                foregroundStyle('primary'),
                textFieldStyle('plain'),
                frame({ maxWidth: Infinity }),
              ]}
            />
          </HStack>
        </VStack>

        {/* Email rows */}
        {filtered.map((email) => (
          <HStack
            key={email.id}
            spacing={12}
            alignment="top"
            modifiers={[
              padding({ vertical: 8 }),
              listRowSeparator('automatic'),
            ]}
          >
            {/* Avatar */}
            <ZStack
              modifiers={[
                frame({ width: 56, height: 56 }),
                background(email.unread ? '#D1E7DD' : PlatformColor('tertiarySystemFill'), {
                  shape: 'circle',
                }),
              ]}
            >
              <Image
                systemName="person.fill"
                size={24}
                color={email.unread ? PlatformColor('systemGreen') : PlatformColor('secondaryLabel')}
              />
            </ZStack>

            {/* Content */}
            <VStack alignment="leading" spacing={2} modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}>
              <HStack>
                <Text
                  modifiers={[
                    font({ size: 17, weight: email.unread ? 'semibold' : 'regular' }),
                    foregroundStyle('primary'),
                    lineLimit(1),
                  ]}
                >
                  {email.sender}
                </Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ size: 15 }),
                    foregroundStyle(email.unread ? 'green' : 'secondary'),
                  ]}
                >
                  {email.date}
                </Text>
              </HStack>
              <Text
                modifiers={[
                  font({ size: 15 }),
                  foregroundStyle('secondary'),
                  lineLimit(2),
                ]}
              >
                {email.subject}
              </Text>
            </VStack>

            {/* Unread badge */}
            {email.unread && (
              <ZStack
                modifiers={[
                  frame({ width: 22, height: 22 }),
                  background('green', { shape: 'circle' }),
                ]}
              >
                <Text
                  modifiers={[
                    font({ size: 13, weight: 'semibold' }),
                    foregroundStyle('white'),
                  ]}
                >
                  1
                </Text>
              </ZStack>
            )}
          </HStack>
        ))}
      </List>
    </Host>
  );
}
