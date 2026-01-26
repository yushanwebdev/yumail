import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
