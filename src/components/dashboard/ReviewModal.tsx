"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Modal, ModalHeader, ModalBody, ModalFooter, modalBtnPrimary, modalBtnSecondary, modalInputCls } from "@/components/ui/Modal";
import { useApp } from "@/components/providers/Providers";
import { Spinner } from "@/components/ui/Spinner";
import { submitReviewAction } from "@backend/actions/reviews";

export type ReviewTarget = {
  ratedId: string;
  ratedName: string;
  ratedAvatarUrl: string | null;
  contextType: "surgery" | "slot";
  contextId: string;
  workLabel: string;
};

/** Estrellas interactivas (1-5) con hover. */
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="transition"
          aria-label={`${i}`}
        >
          <svg
            className={`h-8 w-8 ${i <= active ? "text-amber-400" : "text-mist-300"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2.3l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.98l-5.91 3.11 1.13-6.57L2.45 9.24l6.6-.96z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ReviewModal({
  target,
  onClose,
}: {
  target: ReviewTarget;
  onClose: (done: boolean) => void;
}) {
  const r = useApp().t.dashboard.reviews;
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (rating < 1) {
      setError(r.ratingLabel);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitReviewAction({
        ratedId: target.ratedId,
        contextType: target.contextType,
        contextId: target.contextId,
        rating,
        comment,
      });
      if ("error" in res) setError(res.error);
      else {
        router.refresh();
        onClose(true);
      }
    });
  }

  return (
    <Modal onClose={() => onClose(false)} maxWidth={460} labelledBy="review-modal-title">
      <ModalHeader
        icon={<Avatar name={target.ratedName} src={target.ratedAvatarUrl ?? undefined} size="md" ring="ring-2 ring-white/30" />}
        eyebrow={target.workLabel}
        title={r.title}
        subtitle={`${r.subtitlePrefix} ${target.ratedName}`}
        onClose={() => onClose(false)}
        titleId="review-modal-title"
        closeLabel={r.close}
      />
      <ModalBody>
        <div>
          <div className="mb-2 text-sm font-medium text-ink-800">{r.ratingLabel}</div>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <div>
          <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-ink-800">
            {r.commentLabel}
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={r.commentPlaceholder}
            className={`${modalInputCls} h-auto py-2.5`}
          />
        </div>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </ModalBody>
      <ModalFooter>
        <button type="button" className={modalBtnSecondary} onClick={() => onClose(false)}>
          {r.close}
        </button>
        <button type="button" className={modalBtnPrimary} disabled={pending} onClick={submit}>
          {pending ? (
            <>
              <Spinner size="sm" solid /> {r.submitting}
            </>
          ) : (
            r.submit
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
