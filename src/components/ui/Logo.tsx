import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  variant = "dark",
  withWordmark = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  withWordmark?: boolean;
}) {
  const text = variant === "dark" ? "text-ink-900" : "text-white";
  // Con el wordmark visible, el texto ya aporta el nombre accesible, así que la
  // marca queda como decorativa (alt vacío). Sin wordmark, la marca lleva el alt.
  const alt = withWordmark ? "" : "SaludCoNet";
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark variant={variant} alt={alt} />
      {withWordmark && (
        <span className={cn("text-[17px] font-semibold tracking-tight", text)}>
          Salud<span className="text-cyan-500">Co</span>Net
        </span>
      )}
    </Link>
  );
}

function LogoMark({ variant, alt }: { variant: "dark" | "light"; alt: string }) {
  const cls = "h-8 w-auto shrink-0 transition group-hover:scale-[1.03]";
  // variant "light" = sobre superficie oscura -> siempre la marca clara (S blanca + C cian).
  if (variant === "light") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/logo-mark-light.png" alt={alt} className={cls} />;
  }
  // variant "dark" = superficie clara; en modo oscuro global cambiamos a la clara.
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt={alt} className={cn(cls, "dark:hidden")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark-light.png" alt={alt} className={cn(cls, "hidden dark:block")} />
    </>
  );
}
