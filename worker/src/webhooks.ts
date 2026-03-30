import { Webhook } from 'svix';
import type { EmailReceivedEvent } from './types';

export async function verifyWebhook(
  request: Request,
  secret: string,
): Promise<EmailReceivedEvent> {
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new WebhookError('Missing webhook signature headers', 400);
  }

  const payload = await request.text();
  const wh = new Webhook(secret);

  try {
    const event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as EmailReceivedEvent;
    return event;
  } catch {
    throw new WebhookError('Invalid webhook signature', 401);
  }
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
