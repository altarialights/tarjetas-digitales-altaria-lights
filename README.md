# Tarjetas NFC · Serveo

Tarjetas de visita digitales para tarjetas NFC. Astro + Tailwind CSS, 100 % estático, listo para Vercel.

## Comandos

```bash
npm install
npm run dev       # http://localhost:4321/serveo/mariano-camarero
npm run build     # astro check + build estático en /dist
npm run preview
```

## Cómo funciona

Una única fuente de datos: **`src/data/employees.ts`**. Por cada objeto, `astro build` genera:

| Ruta | Qué es |
| --- | --- |
| `/{companySlug}/{id}` | Tarjeta digital (`src/pages/[company]/[slug].astro`) |
| `/{companySlug}/{id}.vcf` | Contacto vCard 3.0 (`src/pages/[company]/[slug].vcf.ts`) |

La página y la vCard leen **el mismo objeto**: si cambias el teléfono, cambia en los dos sitios.
Los datos se validan en build (`src/lib/employees.ts`): un email inválido, un id mal formado o una URL duplicada detienen el despliegue con un mensaje claro.

## Añadir un empleado

1. Copia un objeto en `src/data/employees.ts` y cambia sus datos (`id` = slug de la URL: minúsculas, números y guiones).
2. Deja la foto en `public/employees/<id>.webp` y apúntala en `photo`.
3. `git push` → Vercel publica `/serveo/<id>` y `/serveo/<id>.vcf`.
4. Graba `https://<dominio>/serveo/<id>` en la tarjeta NFC.

Los campos opcionales (`department`, `address`, `address.extra`, `address.region`, `phoneDisplay`, `photo`) pueden omitirse: simplemente no se muestran.
Si la foto aún no existe, se muestra un monograma con las iniciales (y el build avisa).

## Ayuntamiento de Navaluenga

- Web: `/ayuntamiento-de-navaluenga/armando-garcia-cuenca`.
- Contacto: `/ayuntamiento-de-navaluenga/armando-garcia-cuenca.vcf`.
- La tarjeta usa el mismo registro de `src/data/employees.ts`, componentes,
  iconos y generador VCF que las demás tarjetas, con una paleta azul.
- Organización: Ayuntamiento de Navaluenga. Contacto: Armando García Cuenca,
  alcalde y diputado provincial. Datos transcritos de la tarjeta proporcionada.
- Foto institucional: https://www.diputacionavila.es/fotos/la-diputacion/pleno/armando-garcia-cuenca.jpg
- Logo: https://www.pp.es/wp-content/uploads/2022/08/logo-short.svg
- `phoneType: "WORK"` identifica el fijo de trabajo; `whatsapp: false`
  ofrece correo en lugar de atribuir WhatsApp a ese número.
- `companyLogoAlt` y `logoCaption` identifican por separado el partido y el
  Ayuntamiento. `includeLogoInVCard` incrusta el logo PNG además de la foto JPEG;
  su visualización depende de la aplicación de contactos.

## Assets pendientes de sustituir

| Asset | Ruta | Notas |
| --- | --- | --- |
| Logo Serveo | `public/companies/serveo/logo.png` | Logo oficial en naranja. Se muestra sobre una placa blanca (`.logo-badge` en `EmployeeCard.astro`) para tener contraste sobre la cabecera naranja. Mejor con fondo transparente. |
| Foto de Mariano | `public/employees/mariano-camarero.webp` | Cuadrada, 800×800 px, WebP, < 120 KB, cara centrada. |

## Vercel

- Sin adaptador ni servidor: Vercel detecta Astro y sirve `dist/`.
- `vercel.json` sirve los `.vcf` con `Content-Type: text/vcard; charset=utf-8` y añade `X-Robots-Tag: noindex`.
- Opcional: define `SITE_URL=https://tu-dominio` en Vercel para que la vCard incluya el enlace a la tarjeta digital (por defecto usa el dominio de producción de Vercel).
