import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const after = url.searchParams.get('after') ?? undefined;

    const { data, error } = await resend.emails.receiving.list({
      limit,
      ...(after ? { after } : {}),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (err) {
    console.error('Failed to fetch emails:', err);
    return Response.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}
