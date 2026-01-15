import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string; attachmentId: string }> }
) {
  try {
    const { emailId, attachmentId } = await params;

    if (!emailId || !attachmentId) {
      return NextResponse.json(
        { error: "Missing email ID or attachment ID" },
        { status: 400 }
      );
    }

    // Get filename from query string as fallback
    const url = new URL(request.url);
    const fallbackFilename = url.searchParams.get("filename") || "attachment";

    // Get attachment metadata with download URL from Resend
    const { data, error } = await resend.emails.receiving.attachments.get({
      emailId,
      id: attachmentId,
    });

    if (error) {
      console.error("Resend attachment fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.download_url) {
      return NextResponse.json(
        { error: "Attachment not found or download URL unavailable" },
        { status: 404 }
      );
    }

    // Fetch the actual file content from the download URL
    const fileResponse = await fetch(data.download_url);

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to download attachment" },
        { status: 500 }
      );
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Use Resend filename or fallback from query param
    const filename = data.filename || fallbackFilename;

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": data.content_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(data.size || fileBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("Attachment download error:", err);
    return NextResponse.json(
      { error: "Failed to fetch attachment" },
      { status: 500 }
    );
  }
}
