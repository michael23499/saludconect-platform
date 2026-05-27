/**
 * Construye el objeto `user` que recibe DashboardShell (nombre, subtítulo,
 * avatar). Antes se repetía en ~21 páginas con la misma forma. El subtítulo es
 * "Administrador" en modo admin, o "{rol} · {ciudad}" / "{rol}" según haya ciudad.
 * Las etiquetas se pasan como parámetro (las páginas ya las tienen traducidas).
 */
type ProfileLike = { fullName: string; city: string | null; avatarUrl: string | null };

export function buildDashboardUser(
  profile: ProfileLike,
  opts: { isAdmin: boolean; roleLabel: string; adminLabel?: string },
): { name: string; subtitle: string; avatarUrl: string | null } {
  const subtitle = opts.isAdmin
    ? opts.adminLabel ?? "Administrador"
    : profile.city
      ? `${opts.roleLabel} · ${profile.city}`
      : opts.roleLabel;
  return { name: profile.fullName, subtitle, avatarUrl: profile.avatarUrl };
}
