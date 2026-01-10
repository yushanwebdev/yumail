import { EmailDetailSkeleton } from "@/components/email-detail-skeleton";

export default function ReceivedEmailLoading() {
  return <EmailDetailSkeleton backPath="/received" folder="inbox" />;
}
