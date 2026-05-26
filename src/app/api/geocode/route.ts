import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@backend/auth/rate-limit";

// Server-side para cumplir la política de Nominatim (User-Agent identificable,
// un único origen) y evitar CORS. force-dynamic: depende del query.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type GeoResult = {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
};

export async function GET(request: NextRequest) {
  // Abierto también a invitados porque el formulario de registro (sin sesión)
  // necesita el autocompletado. Para no exponer un proxy abierto a Nominatim,
  // limitamos por IP; combinado con el debounce del cliente, sobra para uso real.
  const allowed = await rateLimit("geocode", 30, 60_000);
  if (!allowed) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json([]);

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "es");
  url.searchParams.set("q", q);

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim exige un User-Agent identificable con forma de contacto.
        "User-Agent": "SaludCoNet/1.0 (https://app.saludconet.com; info@saludconet.com)",
      },
    });
    if (!res.ok) return NextResponse.json([]);

    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>;

    const results: GeoResult[] = data.map((d) => {
      const a = d.address ?? {};
      const city = a.city || a.town || a.village || a.municipality || "";
      return {
        label: d.display_name,
        address: d.display_name,
        city,
        postalCode: a.postcode ?? "",
        lat: Number.parseFloat(d.lat),
        lng: Number.parseFloat(d.lon),
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
