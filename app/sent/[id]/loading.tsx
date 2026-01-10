import { EmailDetailSkeleton } from "@/components/email-detail-skeleton";

export default function SentEmailLoading() {
  return <EmailDetailSkeleton backLabel="Back to Sent" backPath="/sent" />;
}
