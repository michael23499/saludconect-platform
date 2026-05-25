"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { DatePicker } from "@/components/ui/DatePicker";
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete";
import { useApp } from "@/components/providers/Providers";
import { updateSurgeryAction, type UpdateSurgeryInput } from "@backend/actions/surgeries";
import type { Surgery } from "@backend/db";

/**
 * Botón + modal para editar una cirugía. Lo usan la clínica DUEÑA y el ADMIN
 * (intervención de soporte). Si `asAdmin`, muestra un aviso de intervención.
 */
export function EditSurgeryButton({
  surgery,
  asAdmin = false,
}: {
  surgery: Surgery;
  asAdmin?: boolean;
}) {
  const s = useApp().t.dashboard.surgeries;
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-mist-200 bg-white px-3.5 text-sm font-semibold text-ink-800 transition hover:bg-mist-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
        {s.editBtn}
      </button>
      {open && <EditSurgeryModal surgery={surgery} asAdmin={asAdmin} onClose={() => setOpen(false)} />}
    </>
  );
}

function EditSurgeryModal({
  surgery,
  asAdmin,
  onClose,
}: {
  surgery: Surgery;
  asAdmin: boolean;
  onClose: () => void;
}) {
  const s = useApp().t.dashboard.surgeries;
  const router = useRouter();
  const [title, setTitle] = useState(surgery.title);
  const [date, setDate] = useState(surgery.date);
  const [startTime, setStartTime] = useState(surgery.startTime ?? "");
  const [endTime, setEndTime] = useState(surgery.endTime ?? "");
  const [vacancies, setVacancies] = useState(String(surgery.vacancies));
  const [city, setCity] = useState(surgery.city ?? "");
  const [address, setAddress] = useState(surgery.address ?? "");
  const [rate, setRate] = useState(surgery.ratePerHour != null ? String(surgery.ratePerHour) : "");
  const [urgent, setUrgent] = useState(surgery.urgent);
  const [status, setStatus] = useState<Surgery["status"]>(surgery.status);
  const [description, setDescription] = useState(surgery.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const statusOptions: { value: Surgery["status"]; label: string }[] = [
    { value: "open", label: s.optOpen },
    { value: "filled", label: s.optFilled },
    { value: "cancelled", label: s.optCancelled },
    { value: "completed", label: s.optCompleted },
  ];

  function save() {
    setError(null);
    const data: UpdateSurgeryInput = {
      title,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      city: city.trim() || null,
      address: address.trim() || null,
      vacancies: Number.parseInt(vacancies, 10) || 1,
      ratePerHour: rate.trim() ? Number.parseInt(rate, 10) : null,
      urgent,
      status,
      description: description.trim() || null,
    };
    startTransition(async () => {
      const res = await updateSurgeryAction(surgery.id, data);
      if ("error" in res) setError(res.error);
      else {
        router.refresh();
        onClose();
      }
    });
  }

  return (
    <Modal onClose={onClose} maxWidth={560} labelledBy="edit-surgery-title">
      <ModalHeader
        icon={
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
        }
        eyebrow={s.editEyebrow}
        title={surgery.title}
        onClose={onClose}
        titleId="edit-surgery-title"
      />

      <form onSubmit={(e) => { e.preventDefault(); save(); }}>
        <ModalBody>
          {asAdmin && (
            <div className="flex items-start gap-2.5 rounded-sm border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-400/30 dark:text-amber-100">
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.3l-8 14A2 2 0 004 20.5h16a2 2 0 001.7-3.2l-8-14a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>
              <span>{s.adminEditWarn}</span>
            </div>
          )}

          <ModalField label={s.fldTitle}>
            <input className={modalInputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </ModalField>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label={s.fldDate}>
              <DatePicker value={date} onChange={setDate} minToday placeholder="—" />
            </ModalField>
            <ModalField label={s.fldVacancies}>
              <input className={modalInputCls} type="number" min="1" max="20" value={vacancies} onChange={(e) => setVacancies(e.target.value)} />
            </ModalField>
            <ModalField label={s.fldStart}>
              <input className={modalInputCls} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </ModalField>
            <ModalField label={s.fldEnd}>
              <input className={modalInputCls} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </ModalField>
          </div>

          <ModalField label={s.fldAddress}>
            <AddressAutocomplete
              value={address}
              onSelect={(r) => { setAddress(r.address); if (r.city) setCity(r.city); }}
              onTextChange={setAddress}
              placeholder={s.addressPlaceholder}
            />
            {city && <p className="mt-1.5 text-xs text-mist-500">{s.cityLabel} <span className="font-medium text-ink-700">{city}</span></p>}
          </ModalField>

          <div className="grid grid-cols-2 gap-4">
            <ModalField label={s.fldRateShort}>
              <input className={modalInputCls} type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={s.rateOptional} />
            </ModalField>
            <ModalField label={s.fldStatus}>
              <select className={modalInputCls} value={status} onChange={(e) => setStatus(e.target.value as Surgery["status"])}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label={s.fldDescription}>
            <textarea
              rows={3}
              className="w-full rounded-sm border border-mist-200 bg-white px-3.5 py-2 text-sm text-ink-900 outline-none transition placeholder:text-mist-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </ModalField>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-800 select-none">
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="h-4 w-4 rounded border-mist-300" />
            {s.urgentSimple}
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} className={modalBtnSecondary}>{s.cancel}</button>
          <button type="submit" disabled={pending} className={modalBtnPrimary}>{pending ? s.saving : s.saveChanges}</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
