import { useState } from 'react';
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
    <Host style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
              foregroundStyle('#202646'),
            ]}
          >
            Inbox
          </Text>
          <HStack
            modifiers={[
              frame({ maxWidth: Infinity }),
              background('#F2F2F7', { shape: 'roundedRectangle', cornerRadius: 10 }),
              padding({ horizontal: 8, vertical: 8 }),
            ]}
          >
            <Image
              systemName="magnifyingglass"
              size={16}
              color="#8E8E93"
            />
            <TextField
              placeholder="Search"
              defaultValue=""
              onChangeText={setSearch}
              modifiers={[
                font({ size: 17 }),
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
                background(email.unread ? '#D1E7DD' : '#E8E8ED', {
                  shape: 'circle',
                }),
              ]}
            >
              <Image
                systemName="person.fill"
                size={24}
                color={email.unread ? '#198754' : '#8E8E93'}
              />
            </ZStack>

            {/* Content */}
            <VStack alignment="leading" spacing={2} modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}>
              <HStack>
                <Text
                  modifiers={[
                    font({ size: 17, weight: email.unread ? 'semibold' : 'regular' }),
                    foregroundStyle('#202646'),
                    lineLimit(1),
                  ]}
                >
                  {email.sender}
                </Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ size: 15 }),
                    foregroundStyle(email.unread ? '#198754' : '#8E8E93'),
                  ]}
                >
                  {email.date}
                </Text>
              </HStack>
              <Text
                modifiers={[
                  font({ size: 15 }),
                  foregroundStyle('#8E8E93'),
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
                  background('#198754', { shape: 'circle' }),
                ]}
              >
                <Text
                  modifiers={[
                    font({ size: 13, weight: 'semibold' }),
                    foregroundStyle('#FFFFFF'),
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
