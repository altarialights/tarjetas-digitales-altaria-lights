import type { Employee } from "../data/employees";
import { addressLines, clean, publicFile } from "./employees";

const CRLF = "\r\n";

/** Escapa texto según RFC 2426 (vCard 3.0): \ , ; y saltos de línea. */
function esc(value: string | undefined): string {
  return (value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Pliega líneas de más de 75 octetos (RFC 2425 §5.8.1) sin partir
 * caracteres multibyte como "á" o "ñ".
 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
      limit = 74; // las líneas de continuación empiezan con un espacio
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

/**
 * Foto para la vCard: JPEG cuadrado de 400px en base64.
 * iOS y Android solo muestran de forma fiable JPEG dentro de la vCard,
 * así que se convierte desde el archivo original (webp, png…) en build.
 */
async function photoLine(e: Employee): Promise<string | undefined> {
  const file = publicFile(e.photo);
  if (!file) return undefined;
  try {
    const { default: sharp } = await import("sharp");
    const jpeg = await sharp(file)
      .resize(400, 400, { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    return `PHOTO;ENCODING=b;TYPE=JPEG:${jpeg.toString("base64")}`;
  } catch (error) {
    console.warn(`[vcard] No se pudo incrustar la foto de ${e.id}:`, error);
    return undefined;
  }
}

export async function buildVCard(e: Employee, cardUrl?: string): Promise<string> {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    // N: Apellidos;Nombre;Segundo nombre;Prefijo;Sufijo
    `N:${esc(e.lastName.trim())};${esc(e.firstName.trim())};;;`,
    `FN:${esc(e.fullName.trim())}`,
    // ORG: Empresa;Departamento
    `ORG:${esc(e.company.trim())}${clean(e.department) ? `;${esc(clean(e.department))}` : ""}`,
    `TITLE:${esc(e.position.trim())}`,
    `TEL;TYPE=CELL,VOICE:${e.phone.replace(/[^\d+]/g, "")}`,
    `EMAIL;TYPE=INTERNET,WORK:${esc(e.email.trim())}`,
  ];

  if (clean(e.personalEmail)) {
    lines.push(`EMAIL;TYPE=INTERNET,HOME:${esc(e.personalEmail!.trim())}`);
  }

  if (clean(e.linkedin)) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${esc(e.linkedin)}`);
  if (clean(e.companyInstagram)) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${esc(e.companyInstagram)}`);
  if (clean(e.personalInstagram)) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${esc(e.personalInstagram)}`);

  if (e.address) {
    const a = e.address;
    // ADR: apartado;extendida;calle;localidad;región;CP;país
    // La línea "extra" se añade a la calle: iOS ignora el campo "extendida".
    const street = [clean(a.street), clean(a.extra)].filter(Boolean).join("\n");
    lines.push(
      `ADR;TYPE=WORK:;;${esc(street)};${esc(clean(a.city))};${esc(clean(a.region))};${esc(clean(a.postalCode))};${esc(clean(a.country))}`,
    );
    lines.push(`LABEL;TYPE=WORK:${esc([...addressLines(e), clean(a.country)].filter(Boolean).join("\n"))}`);
  }

  if (clean(e.website)) {
    lines.push(`URL;TYPE=WORK:${esc(e.website)}`);
  } else if (cardUrl) {
    lines.push(`URL:${cardUrl}`);
  }

  const photo = await photoLine(e);
  if (photo) lines.push(photo);

  lines.push(`UID:${e.companySlug}-${e.id}`, "END:VCARD");

  return lines.map(fold).join(CRLF) + CRLF;
}
