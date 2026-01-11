import { Resend } from "resend";
import { EmailIframe } from "@/components/email-iframe";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailContentProps {
  resendId: string;
  folder: "inbox" | "sent";
}

export async function EmailContent({ resendId, folder }: EmailContentProps) {
  const { data, error } =
    folder === "inbox"
      ? await resend.emails.receiving.get(resendId)
      : await resend.emails.get(resendId);

  if (error) {
    console.error("Resend fetch error:", error);
    return <p className="text-sm text-zinc-500">Email content not available</p>;
  }

  const html = data?.html || null;
  const text = data?.text || null;

  if (html) {
    return <EmailIframe html={html} />;
  }

  if (text) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
        {text}
      </pre>
    );
  }

  return <p className="text-sm text-zinc-500">Email content not available</p>;
}
