import { Hono } from 'hono';
import type { Env } from './types';
import { verifyWebhook, WebhookError } from './webhooks';
import { sendPushNotification } from './push';

const app = new Hono<{ Bindings: Env }>();

app.post('/api/push-token', async (c) => {
  const body = await c.req.json<{ token?: string }>();

  if (!body.token || !body.token.startsWith('ExponentPushToken[')) {
    return c.json({ error: 'Invalid Expo push token' }, 400);
  }

  await c.env.PUSH_TOKENS.put('latest', body.token);
  return c.json({ success: true });
});

app.post('/api/webhooks/resend', async (c) => {
  try {
    const event = await verifyWebhook(c.req.raw, c.env.RESEND_WEBHOOK_SECRET);

    if (event.type === 'email.received') {
      await sendPushNotification(c.env, event);
    }

    return c.json({ success: true });
  } catch (err) {
    if (err instanceof WebhookError) {
      return c.json({ error: err.message }, err.status as 400 | 401);
    }
    console.error('Webhook processing error:', err);
    return c.json({ error: 'Internal server error' }, 500 as const);
  }
});

export default app;
