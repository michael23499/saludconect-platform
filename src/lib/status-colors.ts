import type { Surgery, Application } from "@backend/db";

/**
 * Mapas estado → tono de Badge, en un solo sitio. Antes estaban duplicados
 * (STATUS_TONE/APP_TONE) en varias páginas del dashboard.
 */
export const SURGERY_STATUS_TONE: Record<Surgery["status"], "success" | "warning" | "neutral" | "brand"> = {
  open: "brand",
  filled: "success",
  cancelled: "neutral",
  completed: "neutral",
};

export const APPLICATION_STATUS_TONE: Record<Application["status"], "success" | "warning" | "neutral"> = {
  applied: "warning",
  confirmed: "success",
  rejected: "neutral",
  withdrawn: "neutral",
};
