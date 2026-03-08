export type Email = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
};

export const emails: Email[] = [
  {
    id: '1',
    sender: 'Studio M',
    subject: 'Project Proposal: Syzygy',
    snippet: '— We have reviewed the initial concepts and...',
    date: '10:42 AM',
    unread: true,
  },
  {
    id: '2',
    sender: 'Peter Saville',
    subject: 'Typography revisions',
    snippet: '— The kerning on the display header needs...',
    date: '09:15 AM',
    unread: true,
  },
  {
    id: '3',
    sender: 'Ami Hasan',
    subject: 'Conference Schedule',
    snippet: '— Please find attached the final itinerary for...',
    date: 'Yesterday',
    unread: true,
  },
  {
    id: '4',
    sender: 'Toni Segarra',
    subject: 'Reference Materials',
    snippet: '— Here are the assets you requested for the...',
    date: 'Yesterday',
    unread: false,
  },
  {
    id: '5',
    sender: 'Mauro Pastore',
    subject: 'Design System Update',
    snippet: "— We've pushed the new tokens to the repo...",
    date: 'Jun 12',
    unread: false,
  },
  {
    id: '6',
    sender: 'Linear App',
    subject: 'Digest: 3 issues assigned',
    snippet: '— You have pending tasks in the current cycle...',
    date: 'Jun 12',
    unread: false,
  },
  {
    id: '7',
    sender: 'Figma',
    subject: 'New comment on "Board 1"',
    snippet: '— @sarah mentioned you in a comment...',
    date: 'Jun 11',
    unread: false,
  },
  {
    id: '8',
    sender: 'Dropbox',
    subject: 'File shared with you',
    snippet: '— "Quarterly_Report_Final.pdf" was shared...',
    date: 'Jun 10',
    unread: false,
  },
  {
    id: '9',
    sender: 'Slack Security',
    subject: 'New login detected',
    snippet: '— We noticed a login from a new device...',
    date: 'Jun 09',
    unread: false,
  },
  {
    id: '10',
    sender: 'Adobe Fonts',
    subject: 'Your subscription renewal',
    snippet: '— Thank you for renewing your creative cloud...',
    date: 'Jun 08',
    unread: false,
  },
];
