"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/**
 * Conserva lo que el usuario ha escrito en el formulario de registro aunque
 * cambie de pestaña clínica ↔ profesional. El estado vive AQUÍ (por encima del
 * switch de rol de RegisterShell), así que no se pierde al re-montar el form.
 * Los campos comunes a ambos roles (email, contraseña, ciudad, especialidad)
 * comparten clave: se rellenan una vez y se mantienen. El teléfono es la
 * excepción: clínica y profesional usan claves distintas (clinicPhone /
 * professionalPhone) para que cada uno sea independiente.
 */
type Ctx = {
  text: Record<string, string>;
  bool: Record<string, boolean>;
  list: Record<string, string[]>;
  setText: (name: string, value: string) => void;
  setBool: (name: string, value: boolean) => void;
  setList: (name: string, value: string[]) => void;
};

const RegisterFormCtx = createContext<Ctx | null>(null);

export function RegisterFormProvider({ children }: { children: ReactNode }) {
  const [text, setTextState] = useState<Record<string, string>>({});
  const [bool, setBoolState] = useState<Record<string, boolean>>({});
  const [list, setListState] = useState<Record<string, string[]>>({});

  const setText = useCallback((name: string, value: string) => {
    setTextState((s) => ({ ...s, [name]: value }));
  }, []);
  const setBool = useCallback((name: string, value: boolean) => {
    setBoolState((s) => ({ ...s, [name]: value }));
  }, []);
  const setList = useCallback((name: string, value: string[]) => {
    setListState((s) => ({ ...s, [name]: value }));
  }, []);

  return (
    <RegisterFormCtx.Provider value={{ text, bool, list, setText, setBool, setList }}>
      {children}
    </RegisterFormCtx.Provider>
  );
}

function useCtx(): Ctx {
  const ctx = useContext(RegisterFormCtx);
  if (!ctx) throw new Error("Usa los campos de registro dentro de <RegisterFormProvider>.");
  return ctx;
}

/** Campo de texto/select controlado por la clave `name`. */
export function useRegisterText(name: string) {
  const ctx = useCtx();
  return {
    value: ctx.text[name] ?? "",
    setValue: (v: string) => ctx.setText(name, v),
  };
}

/** Checkbox controlado por la clave `name`. */
export function useRegisterBool(name: string) {
  const ctx = useCtx();
  return {
    checked: ctx.bool[name] ?? false,
    setChecked: (v: boolean) => ctx.setBool(name, v),
  };
}

/** Lista (multi-select) controlada por la clave `name`. */
export function useRegisterList(name: string) {
  const ctx = useCtx();
  return {
    values: ctx.list[name] ?? EMPTY,
    setValues: (v: string[]) => ctx.setList(name, v),
  };
}

const EMPTY: string[] = [];
