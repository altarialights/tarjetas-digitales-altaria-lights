import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const CRLF = "\r\n";
const fold = (line: string) => {
  const chunks = line.match(/.{1,74}/g) ?? [line];
  return chunks.join(`${CRLF} `);
};

export const GET: APIRoute = async ({ site }) => {
  const logo = await readFile(join(process.cwd(), "public/companies/carniceria-paco/logo.svg"));
  const photo = await sharp(logo).resize(400, 400).flatten({ background: "#ffffff" }).jpeg({ quality: 82 }).toBuffer();
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Paco;Carnicería Salchichería;;;",
    "FN:Carnicería Salchichería Paco",
    "ORG:Carnicería Salchichería Paco",
    "TITLE:Especialidad en ternera y cordero",
    "TEL;TYPE=WORK,VOICE:+34920286035",
    "TEL;TYPE=CELL,VOICE:+34609519424",
    "ADR;TYPE=WORK:;;Plaza de España\, 12;Navaluenga;Ávila;;España",
    "URL:https://wa.me/34609519424",
    ...(site ? [`URL:${new URL("/carniceria-paco", site).href}`] : []),
    `PHOTO;ENCODING=b;TYPE=JPEG:${photo.toString("base64")}`,
    "END:VCARD",
  ];
  return new Response(lines.map(fold).join(CRLF) + CRLF, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="carniceria-paco.vcf"',
    },
  });
};
