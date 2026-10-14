import type { APIRoute } from "astro";
import sharp from "sharp";
import { join } from "node:path";

const CRLF = "\r\n";
function fold(line: string): string {
  const encoder = new TextEncoder();
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
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

export const GET: APIRoute = async ({ site }) => {
  const logo = join(process.cwd(), "public", "companies", "polleria-martin", "logo-v2.png");
  const photo = await sharp(logo).resize(400, 400).flatten({ background: "#ffffff" }).jpeg({ quality: 82 }).toBuffer();
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Martín;Pollería Charcutería;;;",
    "FN:Pollería Charcutería Martín",
    "ORG:Pollería Charcutería Martín",
    "TEL;TYPE=CELL,VOICE:+34615538112",
    "ADR;TYPE=WORK:;;C/ Corredera 65;Navaluenga;Ávila;05100;España",
    "NOTE:Envasados al vacío para restauración y para enviar a tu familia estés donde estés.",
    ...(site ? [`URL:${new URL("/polleria-charcuteria-martin", site).href}`] : []),
    `PHOTO;ENCODING=b;TYPE=JPEG:${photo.toString("base64")}`,
    "UID:polleria-charcuteria-martin-navaluenga",
    "END:VCARD",
  ];
  return new Response(lines.map(fold).join(CRLF) + CRLF, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="polleria-charcuteria-martin.vcf"',
    },
  });
};
