"use client";

import { useActionState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SelectMenu, type SelectOption } from "@/components/ui/SelectMenu";
import { MultiSelectMenu } from "@/components/ui/MultiSelectMenu";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete";
import { PhoneInput } from "@/components/admin/PhoneInput";
import { useRegisterText, useRegisterBool, useRegisterList } from "@/components/register/RegisterFormContext";
import { signUpAction, type SignUpState } from "@backend/auth/sign-up";

const SUBMIT_SHADOW =
  "mt-1 w-full justify-center !shadow-[0_2px_10px_-3px_rgba(5,47,89,0.28)] hover:!shadow-[0_5px_16px_-5px_rgba(5,47,89,0.4)]";

// Mismo aspecto que el componente Input para que el autocompletado no desentone.
const ADDRESS_INPUT_CLS =
  "w-full h-11 rounded-xl border border-mist-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-mist-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition";

/* ------------------------------------------------------------------ */
/* Campos controlados — su valor vive en RegisterFormContext, así que  */
/* sobrevive al cambio de pestaña clínica ↔ profesional.               */
/* ------------------------------------------------------------------ */

type TextFieldProps = {
  name: string;
  label: string;
  className?: string;
  password?: boolean;
} & Omit<ComponentProps<"input">, "name" | "value" | "onChange" | "type"> & {
    type?: ComponentProps<"input">["type"];
  };

function TextField({ name, label, className, password, type, ...rest }: TextFieldProps) {
  const { value, setValue } = useRegisterText(name);
  const common = {
    name,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    ...rest,
  };
  return (
    <Field label={label} className={className}>
      {password ? (
        <PasswordInput {...common} />
      ) : (
        <Input type={type} {...common} />
      )}
    </Field>
  );
}

function SelectField({
  name,
  label,
  options,
  className,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  className?: string;
}) {
  const { t } = useApp();
  const { value, setValue } = useRegisterText(name);
  return (
    <Field label={label} className={className}>
      <SelectMenu
        name={name}
        options={options}
        placeholder={t.register.selectPlaceholder}
        value={value}
        onChange={setValue}
      />
    </Field>
  );
}

function MultiSelectField({
  name,
  label,
  options,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const { values, setValues } = useRegisterList(name);
  return (
    <Field label={label} className={className}>
      <MultiSelectMenu name={name} options={options} values={values} onChange={setValues} placeholder={placeholder} />
    </Field>
  );
}

/**
 * Dirección con autocompletado (Nominatim, vía /api/geocode). Al elegir una
 * sugerencia rellena también ciudad, código postal y coordenadas en el contexto
 * compartido, y los expone como hidden inputs para que lleguen a signUpAction.
 * El campo `city` reacciona solo porque comparte clave en el contexto.
 */
function AddressField({ label, className }: { label: string; className?: string }) {
  const { t } = useApp();
  const addr = useRegisterText("address");
  const city = useRegisterText("city");
  const postal = useRegisterText("postalCode");
  const lat = useRegisterText("lat");
  const lng = useRegisterText("lng");
  return (
    <Field label={label} className={className}>
      <AddressAutocomplete
        value={addr.value}
        inputClassName={ADDRESS_INPUT_CLS}
        placeholder={t.register.addressPlaceholder}
        onTextChange={addr.setValue}
        onSelect={(r) => {
          addr.setValue(r.address);
          if (r.city) city.setValue(r.city);
          postal.setValue(r.postalCode);
          lat.setValue(String(r.lat));
          lng.setValue(String(r.lng));
        }}
      />
      <input type="hidden" name="address" value={addr.value} />
      <input type="hidden" name="postalCode" value={postal.value} />
      <input type="hidden" name="lat" value={lat.value} />
      <input type="hidden" name="lng" value={lng.value} />
    </Field>
  );
}

/**
 * Teléfono con el mismo comportamiento que el panel de edición (PhoneInput):
 * selector de país, solo dígitos y agrupados de 3 en 3. Como PhoneInput es
 * controlado y no expone un input con `name`, volcamos el valor en un hidden
 * input para que llegue a signUpAction vía FormData.
 *
 * `field` es la clave en el contexto: clínica y profesional usan claves
 * distintas para que cada teléfono sea independiente (escribir en uno no
 * arrastra el valor al otro), aunque ambos se envían como "phone" —solo se
 * monta un formulario a la vez según el rol—.
 */
function PhoneField({ field, label, className }: { field: string; label: string; className?: string }) {
  const { t } = useApp();
  const { value, setValue } = useRegisterText(field);
  return (
    <Field label={label} className={className}>
      <PhoneInput
        value={value}
        onChange={setValue}
        rounded="xl"
        d={{ searchCountry: t.register.searchCountry, noCountryResults: t.register.noCountryResults }}
      />
      <input type="hidden" name="phone" value={value} />
    </Field>
  );
}

function CheckField({
  name,
  required,
  className,
  children,
}: {
  name: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { checked, setChecked } = useRegisterBool(name);
  return (
    <AnimatedCheckbox
      name={name}
      required={required}
      checked={checked}
      onCheckedChange={setChecked}
      className={className}
    >
      {children}
    </AnimatedCheckbox>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario de clínica                                              */
/* ------------------------------------------------------------------ */

export function RegisterClinicForm() {
  const { t } = useApp();
  const r = t.register;
  const [state, formAction] = useActionState<SignUpState, FormData>(signUpAction, null);

  if (state?.kind === "confirm-email") return <ConfirmEmailView email={state.email} />;
  const error = state?.kind === "error" ? state.message : null;

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="role" value="clinic" />
      <div className="flex items-center gap-2">
        <Badge tone="brand">{r.cfBadge}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="clinicName" label={r.cfName} required placeholder="Clínica Mediterránea" />
        <TextField name="contact" label={r.cfContact} placeholder="Marta Vives" />
        {/* Dirección primero: al elegir una sugerencia, la ciudad se rellena sola. */}
        <AddressField label={r.cfAddress} />
        <TextField name="city" label={r.cfCity} placeholder="Se rellena con la dirección" />
        <TextField name="email" label={r.cfEmail} type="email" required autoComplete="email" placeholder="info@clinica.com" />
        <PhoneField field="clinicPhone" label={r.cfPhone} />
        <MultiSelectField
          name="especialidades"
          label={r.cfSpecialties}
          options={r.specialties}
          placeholder={r.cfSpecialtiesPlaceholder}
          className="md:col-span-2"
        />
        <SelectField name="tamano" label={r.cfTeam} options={r.teamSizes} className="md:col-span-2" />
        <TextField
          name="password"
          label={r.cfPassword}
          password
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={r.passwordPlaceholder}
          className="md:col-span-2"
        />
      </div>
      <CheckField name="trial" className="mt-1">
        {r.cfTrial1}
        <strong>{r.cfTrialDays}</strong>
        {r.cfTrial2}
        <strong>{r.cfTrialPlan}</strong>
        {r.cfTrial3}
      </CheckField>
      <ErrorBox message={error} />
      <SubmitButton label={r.cfSubmit} />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario de profesional                                          */
/* ------------------------------------------------------------------ */

export function RegisterProfessionalForm() {
  const { t } = useApp();
  const r = t.register;
  const [state, formAction] = useActionState<SignUpState, FormData>(signUpAction, null);

  if (state?.kind === "confirm-email") return <ConfirmEmailView email={state.email} />;
  const error = state?.kind === "error" ? state.message : null;

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="role" value="professional" />
      <div className="flex items-center gap-2">
        <Badge tone="brand">{r.pfBadge}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField name="firstName" label={r.pfFirstName} required placeholder="Lucía" />
        <TextField name="lastName" label={r.pfLastName} required placeholder="Martín García" />
        <SelectField name="profesion" label={r.pfProfession} options={r.professions} />
        <SelectField name="especialidad" label={r.pfSpecialty} options={r.specialties} />
        <SelectField name="city" label={r.pfCity} options={r.regions} />
        <PhoneField field="professionalPhone" label={r.pfPhone} />
        <TextField name="email" label={r.pfEmail} type="email" required autoComplete="email" placeholder="tu@email.com" className="md:col-span-2" />
        <TextField
          name="password"
          label={r.pfPassword}
          password
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={r.passwordPlaceholder}
          className="md:col-span-2"
        />
      </div>
      <CheckField name="docs_consent" required className="mt-1">
        {r.pfConsent}
      </CheckField>
      <ErrorBox message={error} />
      <SubmitButton label={r.pfSubmit} />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                 */
/* ------------------------------------------------------------------ */

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { t } = useApp();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={SUBMIT_SHADOW} disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {t.register.creating}
        </>
      ) : (
        label
      )}
    </Button>
  );
}

/** Estado tras un alta que requiere confirmar el correo (confirmación de email activada). */
function ConfirmEmailView({ email }: { email: string }) {
  const { t } = useApp();
  const r = t.register;
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center scale-in">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-200">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m22 6-10 7L2 6" />
            <path d="M2 6h20v12H2z" />
          </svg>
        </span>
        <h3 className="mt-3 text-base font-semibold text-ink-900">{r.confirmEmailTitle}</h3>
        <p className="mt-1 text-sm text-mist-600">
          {r.confirmEmailPre} <span className="font-medium text-ink-800">{email}</span>.
          <br />
          {r.confirmEmailSuf}
        </p>
      </div>
    </div>
  );
}
