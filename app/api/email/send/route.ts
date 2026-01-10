import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, subject, html, text } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: from || "YuMail <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text || "",
      text: text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Store sent email metadata in Convex
    const recipients = (Array.isArray(to) ? to : [to]).map((email: string) => ({
      email,
      name: email.split("@")[0],
    }));

    const fromAddress = from || "YuMail <onboarding@resend.dev>";
    const fromMatch = fromAddress.match(/^(.+?)\s*<(.+)>$/);
    const fromParsed = fromMatch
      ? { name: fromMatch[1].trim(), email: fromMatch[2].trim() }
      : { name: fromAddress.split("@")[0], email: fromAddress };

    await convex.mutation(api.emails.createSent, {
      resendId: data!.id,
      from: fromParsed,
      to: recipients,
      subject,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, id: data!.id });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
