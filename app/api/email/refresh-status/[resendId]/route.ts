import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "@/lib/convex-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resendId: string }> }
) {
  try {
    const { resendId } = await params;

    const { data, error } = await resend.emails.get(resendId);

    if (error) {
      console.error("Failed to fetch email from Resend:", error);
      return NextResponse.json(
        { error: "Failed to fetch email status" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    const email = await fetchQuery(api.emails.getByResendId, { resendId });

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in database" },
        { status: 404 }
      );
    }

    const deliveryStatus = data.last_event as
      | "queued"
      | "sent"
      | "delivered"
      | "delayed"
      | "bounced"
      | "complained"
      | undefined;

    if (deliveryStatus && deliveryStatus !== email.deliveryStatus) {
      await fetchMutation(api.emails.refreshDeliveryStatus, {
        resendId,
        status: deliveryStatus,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      status: deliveryStatus || email.deliveryStatus,
    });
  } catch (error) {
    console.error("Error refreshing delivery status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
