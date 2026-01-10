import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "inbox";

    if (!id) {
      return NextResponse.json(
        { error: "Missing email ID" },
        { status: 400 }
      );
    }

    if (folder === "sent") {
      // Fetch sent email content using emails.get()
      const { data, error } = await resend.emails.get(id);

      if (error) {
        console.error("Resend fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        html: data?.html || null,
        text: data?.text || null,
        headers: null,
      });
    } else {
      // Fetch received email content using emails.receiving.get()
      // @ts-expect-error - Resend SDK types may not include receiving API
      const { data, error } = await resend.emails.receiving.get(id);

      if (error) {
        console.error("Resend fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        html: data?.html || null,
        text: data?.text || null,
        headers: data?.headers || null,
      });
    }
  } catch (err) {
    console.error("Fetch email content error:", err);
    return NextResponse.json(
      { error: "Failed to fetch email content" },
      { status: 500 }
    );
  }
}
