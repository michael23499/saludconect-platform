"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MultiSelectMenu } from "@/components/ui/MultiSelectMenu";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete";
import { useApp } from "@/components/providers/Providers";
import { updateMyProfileAction, uploadMyAvatarAction, type MyProfileInput } from "@backend/actions/settings";

export type AccountData = {
  role: "professional" | "clinic" | "admin";
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  avatarUrl: string | null;
  specialtyName: string | null;
  /** Solo profesional: médico o técnico. */
  proType?: "doctor" | "technician";
  headline: string;
  bio: string;
  yearsExperience: string;
  hourlyRate: string;
  clinicName: string;
  specialties: string[];
  about: string;
  website: string;
};

const FIELD_INPUT =
  "h-11 w-full rounded-lg border border-mist-200 bg-white px-3 text-sm text-ink-800 transition placeholder:text-mist-400 hover:border-mist-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

/**
 * Formulario REAL del panel "Cuenta" de Ajustes (sustituye la maqueta). Edita
 * los datos del usuario en sesión (users) y su perfil extendido según el rol
 * (clínica → datos del centro; profesional → titular/bio/experiencia/tarifa).
 * Avatar editable y dirección con autocompletado (Nominatim). Persiste vía
 * server actions reutilizando las queries existentes.
 */
export function AccountSettingsForm({ account }: { account: AccountData }) {
  const router = useRouter();
  const { t } = useApp();
  const isClinic = account.role === "clinic";

  const [fullName, setFullName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phone);
  const [city, setCity] = useState(account.city);
  const [address, setAddress] = useState(account.address);
  const [postalCode, setPostalCode] = useState(account.postalCode);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: account.lat, lng: account.lng });
  const [avatarUrl, setAvatarUrl] = useState(account.avatarUrl);
  // Profesional
  const [proType, setProType] = useState<"doctor" | "technician">(account.proType ?? "technician");
  const [headline, setHeadline] = useState(account.headline);
  const [bio, setBio] = useState(account.bio);
  const [years, setYears] = useState(account.yearsExperience);
  const [rate, setRate] = useState(account.hourlyRate);
  // Clínica (el nombre del centro = fullName; aquí solo datos promocionales)
  const [specialties, setSpecialties] = useState<string[]>(account.specialties);
  const [about, setAbout] = useState(account.about);
  const [website, setWebsite] = useState(account.website);

  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    setUploading(true);
    setMsg(null);
    startTransition(async () => {
      const res = await uploadMyAvatarAction(fd);
      setUploading(false);
      if ("error" in res) setMsg({ error: res.error });
      else {
        setAvatarUrl(res.url);
        router.refresh();
      }
    });
  }

  function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const data: MyProfileInput = {
      fullName,
      phone,
      city,
      address,
      postalCode,
      lat: coords.lat,
      lng: coords.lng,
      ...(isClinic
        ? { clinicName: fullName, specialties, about, website }
        : {
            proType,
            headline,
            bio,
            yearsExperience: years.trim() ? Number.parseInt(years, 10) : null,
            hourlyRate: rate.trim() ? Number.parseInt(rate, 10) : null,
          }),
    };
    startTransition(async () => {
      const res = await updateMyProfileAction(data);
      if ("error" in res) setMsg({ error: res.error });
      else {
        setMsg({ ok: true });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-2xl border border-mist-200 bg-white p-6">
        <header className="mb-5">
          <h3 className="text-base font-semibold tracking-tight text-ink-900">
            {isClinic ? "Perfil de la clínica" : "Perfil profesional"}
          </h3>
          <p className="mt-0.5 text-sm text-mist-500">
            {isClinic
              ? "Estos datos son los que ven los técnicos en tus cirugías y el directorio."
              : "Estos datos son los que ven las clínicas en el directorio y tus postulaciones."}
          </p>
        </header>

        {/* Avatar editable */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="group relative rounded-full disabled:opacity-70"
            aria-label="Cambiar foto"
          >
            <Avatar name={fullName || account.email} src={avatarUrl ?? undefined} size="xl" ring="ring-2 ring-mist-200" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-950/50 opacity-0 transition group-hover:opacity-100">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarChange} />
          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Subiendo…" : "Cambiar foto"}
            </Button>
            <span className="text-xs text-mist-500">JPG, PNG o WebP · máx. 2 MB</span>
          </div>
        </div>

        {/* Campos */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label={isClinic ? "Nombre de la clínica" : "Nombre completo"}>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" hint="Ligado a tu inicio de sesión, no se edita aquí.">
            <Input value={account.email} disabled className="opacity-70" />
          </Field>
          <Field label="Teléfono">
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
          </Field>
          <Field label="Ciudad">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Dirección">
              <AddressAutocomplete
                value={address}
                inputClassName={FIELD_INPUT}
                placeholder="Escribe la dirección y elige una sugerencia…"
                onTextChange={setAddress}
                onSelect={(r) => {
                  setAddress(r.address);
                  if (r.city) setCity(r.city);
                  setPostalCode(r.postalCode);
                  setCoords({ lat: r.lat, lng: r.lng });
                }}
              />
            </Field>
          </div>

          {isClinic ? (
            <>
              <div className="md:col-span-2">
                <Field label="Especialidades" hint="Las áreas que ofrece tu centro. Puedes elegir varias.">
                  <MultiSelectMenu
                    options={t.register.specialties}
                    values={specialties}
                    onChange={setSpecialties}
                    placeholder={t.register.cfSpecialtiesPlaceholder}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Sitio web">
                  <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://tuclinica.com" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Descripción pública" hint="Cómo te presentas a los técnicos.">
                  <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Cuenta brevemente quién sois, qué tipo de cirugías hacéis…" />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field label={t.register.pfType}>
                <SelectMenu
                  value={proType}
                  onChange={(v) => setProType(v as "doctor" | "technician")}
                  options={[
                    { value: "technician", label: t.dashboard.surgeries.typeTechnician },
                    { value: "doctor", label: t.dashboard.surgeries.typeDoctor },
                  ]}
                />
              </Field>
              <Field label="Especialidad" hint="Por ahora solo microinjerto capilar.">
                <Input value={account.specialtyName ?? "Técnico capilar"} disabled className="opacity-70" />
              </Field>
              <Field label="Años de experiencia">
                <Input type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} placeholder="0" />
              </Field>
              <Field label="Tarifa orientativa (€/h)" hint="Déjalo vacío para mostrar 'A convenir'.">
                <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="A convenir" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Titular">
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="p. ej. Técnica capilar FUE senior" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Sobre mí" hint="Tu presentación para las clínicas.">
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntales tu experiencia y qué te diferencia…" />
                </Field>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white/90 p-3 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="ml-2 text-xs">
          {msg?.ok ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
              Cambios guardados
            </span>
          ) : msg?.error ? (
            <span className="text-red-600">{msg.error}</span>
          ) : (
            <span className="text-mist-500">Recuerda guardar los cambios antes de salir.</span>
          )}
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
