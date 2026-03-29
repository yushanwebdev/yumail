export type Env = {
  PUSH_TOKENS: KVNamespace;
  RESEND_WEBHOOK_SECRET: string;
};

export type EmailReceivedEvent = {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    created_at: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
    }>;
  };
};
