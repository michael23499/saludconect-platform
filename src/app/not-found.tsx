import Link from "next/link";
import { getDict } from "@/lib/i18n-server";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";

export default async function NotFound() {
  const e = (await getDict()).errorPage;
  return (
    <FeedbackCard title={e.notFoundTitle} message={e.notFoundMessage}>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-[15px] font-medium text-white transition hover:bg-brand-700"
      >
        {e.backHome}
      </Link>
    </FeedbackCard>
  );
}
