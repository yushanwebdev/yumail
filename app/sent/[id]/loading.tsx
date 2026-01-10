import { EmailDetailSkeleton } from "@/components/email-detail-skeleton";

export default function SentEmailLoading() {
  return <EmailDetailSkeleton backPath="/sent" folder="sent" />;
}
