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
    const logoPath = join(
        process.cwd(),
        "public",
        "companies",
        "carniceria-jesus",
        "logo.png",
    );
    const photo = await sharp(logoPath)
        .resize(400, 400, { fit: "contain", background: "#ffffff" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 83 })
        .toBuffer();
    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Jesús;Carnicería;;;",
        "FN:Carnicería Jesús",
        "ORG:Carnicería Jesús",
        "TITLE:Ternera avileña negra ibérica\, cordero\, cabrito y cochinillo",
        "TEL;TYPE=WORK,VOICE:+34920286389",
        "TEL;TYPE=CELL,VOICE:+34669575504",
        "TEL;TYPE=CELL,VOICE:+34620417833",
        "EMAIL;TYPE=INTERNET,WORK:carniceriajesusnavaluenga@gmail.com",
        "ADR;TYPE=WORK:;;C/ Corredera\, 55;Navaluenga;Ávila;;España",
        "item1.URL:https://www.facebook.com/share/18qtEyNpws/?mibextid=wwXIfr",
        "item1.X-ABLabel:Facebook",
        "item2.URL:https://www.instagram.com/carniceriajesus_navaluenga/",
        "item2.X-ABLabel:Instagram",
        ...(site ? [`URL:${new URL("/carniceria-jesus", site).href}`] : []),
        `PHOTO;ENCODING=b;TYPE=JPEG:${photo.toString("base64")}`,
        "UID:carniceria-jesus-navaluenga",
        "END:VCARD",
    ];
    return new Response(lines.map(fold).join(CRLF) + CRLF, {
        headers: {
            "Content-Type": "text/vcard; charset=utf-8",
            "Content-Disposition": 'inline; filename="carniceria-jesus.vcf"',
        },
    });
};
