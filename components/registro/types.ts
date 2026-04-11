// ── Shared types for Onboarding/Registro steps ──

export interface FormData {
  firstName: string; surname: string; dni: string; dob: string;
  phone: string; email: string; isla: string; municipio: string; empadronamiento: string;
  hasCertificate: boolean;
  agrupacion: string; instrument: string;
  agrupacion2: string; instrument2: string;
  agrupacion3: string; instrument3: string;
  trabajo: string; estudios: string;
  username: string; password: string;
}

export type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
