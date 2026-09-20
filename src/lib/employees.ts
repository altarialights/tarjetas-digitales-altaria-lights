import { existsSync } from "node:fs";
import { join } from "node:path";
import { employees, type Employee } from "../data/employees";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9]{6,15}$/;

/** Limpia un campo opcional: "", "  ", null o undefined → undefined. */
export function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Valida el array de employees.ts en tiempo de build.
 * Un error aquí detiene el despliegue con un mensaje claro, en lugar de
 * publicar una tarjeta rota o con "undefined" en pantalla.
 */
function validate(list: Employee[]): Employee[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  list.forEach((e, index) => {
    const who = `employees[${index}] (${e.id || "sin id"})`;
    const required: (keyof Employee)[] = [
      "id", "companySlug", "company", "firstName", "lastName",
      "fullName", "position", "phone", "email", "companyLogo",
    ];
    for (const key of required) {
      if (typeof e[key] !== "string" || !clean(e[key] as string)) {
        errors.push(`${who}: falta el campo obligatorio "${key}".`);
      }
    }
    if (e.id && !SLUG.test(e.id)) errors.push(`${who}: "id" solo admite minúsculas, números y guiones (sin tildes ni espacios).`);
    if (e.companySlug && !SLUG.test(e.companySlug)) errors.push(`${who}: "companySlug" solo admite minúsculas, números y guiones.`);
    if (e.email && !EMAIL.test(e.email.trim())) errors.push(`${who}: el email "${e.email}" no es válido.`);
    if (e.phone && !PHONE.test(e.phone.replace(/[\s().-]/g, ""))) errors.push(`${who}: el teléfono "${e.phone}" no es válido (usa formato +34600000000).`);
    if (e.address && (!clean(e.address.street) || !clean(e.address.city))) {
      errors.push(`${who}: si hay "address", necesita al menos "street" y "city".`);
    }

    const key = `${e.companySlug}/${e.id}`;
    if (seen.has(key)) errors.push(`${who}: la URL /${key} está duplicada.`);
    seen.add(key);
  });

  if (errors.length) {
    throw new Error(`\n\n[employees.ts] Hay errores en los datos:\n  · ${errors.join("\n  · ")}\n`);
  }
  return list;
}

export const allEmployees = validate(employees);

/* ------------------------------------------------------------------ */
/*  Derivados: todo se calcula a partir del mismo objeto Employee.     */
/* ------------------------------------------------------------------ */

export const cardPath = (e: Employee) => `/${e.companySlug}/${e.id}`;
export const vcardPath = (e: Employee) => `/${e.companySlug}/${e.id}.vcf`;

/** Teléfono apto para `tel:` (solo + y dígitos). */
export const phoneHref = (e: Employee) => `tel:${e.phone.replace(/[^\d+]/g, "")}`;
export const phoneLabel = (e: Employee) => clean(e.phoneDisplay) ?? e.phone;

/** Abre una conversación de WhatsApp con el teléfono del empleado. */
export function whatsappHref(e: Employee): string {
  const phone = e.phone.replace(/\D/g, "");
  const text = `Hola ${e.firstName.trim()}!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** Abre una redacción nueva en Gmail web sin depender del protocolo `mailto:`. */
export function emailHref(e: Employee): string {
  const params = new URLSearchParams({
    fs: "1",
    tf: "cm",
    to: e.email.trim(),
    su: `Hola ${e.firstName.trim()}!`,
  });
  return `https://mail.google.com/mail/u/0/?${params.toString()}`;
}

export function initials(e: Employee): string {
  const first = e.firstName.trim()[0] ?? "";
  const last = e.lastName.trim()[0] ?? "";
  return (first + last).toLocaleUpperCase("es");
}

/** Líneas de dirección listas para pintar, sin huecos vacíos. */
export function addressLines(e: Employee): string[] {
  const a = e.address;
  if (!a) return [];
  const locality = [clean(a.postalCode), clean(a.city)].filter(Boolean).join(" - ");
  return [clean(a.street), clean(a.extra), locality].filter((l): l is string => Boolean(l));
}

/** URL universal de Google Maps (abre la app nativa si está instalada). Sin API. */
export function mapsHref(e: Employee): string | undefined {
  const a = e.address;
  if (!a) return undefined;
  const query = [a.street, a.extra, [a.postalCode, a.city].filter(Boolean).join(" "), a.region, a.country]
    .map((part) => clean(part))
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Ruta absoluta en disco de un archivo de /public, o undefined si no existe. */
export function publicFile(path: string | undefined): string | undefined {
  const rel = clean(path);
  if (!rel || /^https?:\/\//.test(rel)) return undefined;
  const abs = join(process.cwd(), "public", rel.replace(/^\/+/, ""));
  return existsSync(abs) ? abs : undefined;
}

/** true si la foto de la persona existe realmente en /public. */
export const hasPhoto = (e: Employee) => Boolean(publicFile(e.photo));
