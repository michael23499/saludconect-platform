"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { PhoneInput } from "@/components/admin/PhoneInput";
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete";
import { MiniMap } from "@/components/admin/MiniMap";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalField,
  modalInputCls,
  modalBtnPrimary,
  modalBtnSecondary,
} from "@/components/ui/Modal";
import { updateUserProfileAction, uploadUserAvatarAction } from "@backend/actions/admin-users";
import type { User } from "@backend/db";

type AdminDict = Record<string, string>;

export function EditUserModal({
  user,
  d,
  onClose,
  onSaved,
}: {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    city: string | null;
    address: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
    avatarUrl: string | null;
  };
  d: AdminDict;
  onClose: () => void;
  onSaved?: (patch: Partial<User>) => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [postalCode, setPostalCode] = useState(user.postalCode ?? "");
  const [lat, setLat] = useState<number | null>(user.lat ?? null);
  const [lng, setLng] = useState<number | null>(user.lng ?? null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    uploadUserAvatarAction(user.id, fd)
      .then((res) => {
        if ("url" in res) { setAvatarUrl(res.url); onSaved?.({ avatarUrl: res.url }); }
        else setError(res.error);
      })
      .catch(() => setError("No se pudo subir la imagen."))
      .finally(() => setUploading(false));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserProfileAction(user.id, { fullName, phone, city, address, postalCode, lat, lng });
        onSaved?.({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          city: city.trim() || null,
          address: address.trim() || null,
          postalCode: postalCode.trim() || null,
          lat,
          lng,
        });
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  const editableAvatar = (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="group relative inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
      aria-label={d.editAvatar}
      title={d.editAvatar}
    >
      <Avatar name={user.fullName} src={avatarUrl ?? undefined} size="lg" ring="ring-2 ring-white/25" />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
        {uploading ? (
          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
        ) : (
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="3.2" /></svg>
        )}
      </span>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </button>
  );

  return (
    <Modal onClose={onClose} maxWidth={580} labelledBy="edit-user-title">
      <ModalHeader
        icon={editableAvatar}
        eyebrow={d.editUser}
        title={user.fullName}
        subtitle={user.email}
        onClose={onClose}
        titleId="edit-user-title"
        closeLabel={d.cancel}
      />

      <form onSubmit={(e) => { e.preventDefault(); save(); }}>
        <ModalBody>
          <ModalField label={d.fieldName}>
            <input className={modalInputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
          </ModalField>

          <ModalField label={d.colEmail} hint={d.emailReadonlyHint}>
            <div className="relative">
              <input className={`${modalInputCls} cursor-not-allowed bg-mist-50 pr-10 text-mist-500`} value={user.email} disabled readOnly />
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
            </div>
          </ModalField>

          <ModalField label={d.colPhone}>
            <PhoneInput value={phone} onChange={setPhone} d={d} />
          </ModalField>

          <ModalField label={d.addressLabel}>
            <AddressAutocomplete
              value={address}
              d={d}
              onTextChange={setAddress}
              onSelect={(r) => { setAddress(r.address); setCity(r.city); setPostalCode(r.postalCode); setLat(r.lat); setLng(r.lng); }}
            />
          </ModalField>

          {lat != null && lng != null && <MiniMap lat={lat} lng={lng} />}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} className={modalBtnSecondary}>{d.cancel}</button>
          <button type="submit" disabled={pending} className={modalBtnPrimary}>{pending ? d.saving : d.save}</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
