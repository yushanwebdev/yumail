import { EmailDetailSkeleton } from "@/components/email-detail-skeleton";

export default function ReceivedEmailLoading() {
  return (
    <EmailDetailSkeleton backLabel="Back to Received" backPath="/received" />
  );
}
