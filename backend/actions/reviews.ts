"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "../auth/guards";
import { createReview, listPendingReviewsForUser } from "../queries/reviews";

export type ReviewResult = { ok: true } | { error: string };

export type SubmitReviewInput = {
  ratedId: string;
  contextType: "surgery" | "slot";
  contextId: string;
  rating: number;
  comment?: string;
};

/**
 * Deja una valoración (1-5 estrellas + comentario) sobre la otra parte de un
 * trabajo terminado. Valida contra la lista de trabajos pendientes del usuario,
 * que ya garantiza: que participó, que la fecha pasó y que no había valorado.
 */
export async function submitReviewAction(input: SubmitReviewInput): Promise<ReviewResult> {
  const me = await requireRole(["clinic", "professional"]);
  if (me.profile.role === "admin") {
    return { error: "Los administradores no dejan valoraciones." };
  }

  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Selecciona una puntuación de 1 a 5 estrellas." };
  }

  // Solo se puede valorar un trabajo terminado en el que participaste y que aún
  // no valoraste. listPendingReviewsForUser encapsula exactamente esa condición.
  const pending = await listPendingReviewsForUser(me.profile.id);
  const match = pending.find(
    (p) =>
      p.contextType === input.contextType &&
      p.contextId === input.contextId &&
      p.ratedId === input.ratedId,
  );
  if (!match) {
    return { error: "Este trabajo ya no está disponible para valorar." };
  }

  await createReview({
    raterId: me.profile.id,
    ratedId: input.ratedId,
    contextType: input.contextType,
    contextId: input.contextId,
    rating,
    comment: input.comment?.trim() || null,
  });

  revalidatePath("/dashboard/clinic");
  revalidatePath("/dashboard/professional");
  revalidatePath(`/professionals/${input.ratedId}`);
  return { ok: true };
}
