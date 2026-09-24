/**
 * ÚNICA FUENTE DE DATOS DE LAS TARJETAS.
 *
 * Cada objeto de este array genera automáticamente en `astro build`:
 *   · la tarjeta digital  →  /{companySlug}/{id}
 *   · su vCard            →  /{companySlug}/{id}.vcf
 *
 * Para añadir a una persona: copia un objeto, cambia los datos, deja su foto
 * en /public/employees/ y haz push. No hay que crear ningún archivo .astro.
 *
 * Los campos marcados con `?` son opcionales: si no existen, la interfaz y la
 * vCard simplemente los omiten.
 */

export interface EmployeeAddress {
    /** Calle y número. Ej.: "Calle Quintanavides 21, Edif. 5" */
    street: string;
    /** Línea adicional: parque empresarial, planta, oficina… */
    extra?: string;
    postalCode: string;
    city: string;
    /** Provincia / región (opcional). */
    region?: string;
    country: string;
}

export interface Employee {
    /** Slug de la persona en la URL. Solo minúsculas, números y guiones. */
    id: string;
    /** Slug de la empresa en la URL. Solo minúsculas, números y guiones. */
    companySlug: string;
    /** Nombre comercial de la empresa, tal y como debe aparecer. */
    company: string;

    firstName: string;
    /** Apellidos. */
    lastName: string;
    fullName: string;

    position: string;
    department?: string;

    /** Teléfono en formato internacional sin espacios (se usa en tel: y en la vCard). */
    phone: string;
    /** Teléfono tal y como se muestra en pantalla. Si falta, se usa `phone`. */
    phoneDisplay?: string;

    email: string;
    /** Correo personal adicional. */
    personalEmail?: string;

    linkedin?: string;
    companyInstagram?: string;
    personalInstagram?: string;
    website?: string;

    address?: EmployeeAddress;

    /**
     * Ruta de la fotografía dentro de /public. Ej.: "/employees/mariano-camarero.webp".
     * Si el archivo todavía no existe se muestra un monograma elegante con sus iniciales.
     */
    photo?: string;

    /** Ruta del logo dentro de /public. */
    companyLogo: string;
    /** Usa una placa oscura para logos con texto blanco. */
    logoOnDark?: boolean;

    /** Colores corporativos opcionales. Si faltan, se usa la paleta de Serveo. */
    brand?: {
        color: string;
        dark: string;
        ink: string;
        tint: string;
        tintSoft: string;
        highlight: string;
        shadow: string;
    };

    /** `false` evita incluir la web de la tarjeta digital en el contacto descargado. */
    includeWebsiteInVCard?: boolean;
}

export const employees: Employee[] = [
    {
        id: "martin-camarero",
        companySlug: "altaria-lights",
        company: "Altaria Lights",

        firstName: "Martín",
        lastName: "Camarero Benavente",
        fullName: "Martín Camarero Benavente",

        position: "Fundador",

        phone: "+34619132563",
        phoneDisplay: "+34 619 132 563",

        email: "altarialights@gmail.com",
        personalEmail: "martincb002@gmail.com",
        linkedin: "https://www.linkedin.com/in/martin-camarero/",
        companyInstagram: "https://www.instagram.com/altariacards/",
        personalInstagram: "https://www.instagram.com/martin.altaria/",
        website: "https://altarialights.com",

        photo: "/employees/martin-camarero.png",
        companyLogo: "/companies/altaria-lights/logo.png",
        logoOnDark: true,

        brand: {
            color: "#075cff",
            dark: "#0044d6",
            ink: "#00399f",
            tint: "#dbe8ff",
            tintSoft: "#f0f5ff",
            highlight: "#2673ff",
            shadow: "0 45 135",
        },

        includeWebsiteInVCard: true,
    },
    {
        id: "angel-c-hernandez",
        companySlug: "serveo",
        company: "Serveo",

        firstName: "Ángel",
        lastName: "C Hernández Alguacil",
        fullName: "Ángel C Hernández Alguacil",

        position: "Area Manager Obras",
        department: "Government Centro",

        phone: "+34636415306",
        phoneDisplay: "636 41 53 06",

        email: "angel.hernandezalguacil@serveo.com",

        address: {
            street: "C/ Rosalind Franklin, 58",
            city: "Getafe",
            postalCode: "",
            country: "España",
        },

        photo: "/employees/angel-c-hernandez.webp",

        companyLogo: "/companies/serveo/logo.png",
        includeWebsiteInVCard: false,
    },
    {
        id: "mariano-camarero",
        companySlug: "serveo",
        company: "Serveo",

        firstName: "Mariano",
        lastName: "Camarero Hernández",
        fullName: "Mariano Camarero Hernández",

        position: "Quantity Surveyor",
        department: "Government Centro",

        phone: "+34648178182",
        phoneDisplay: "+34 648 178 182",

        email: "mcamarero@serveo.com",

        address: {
            street: "Calle Rosalind Franklin, 58",
            extra: "Getafe",
            postalCode: "28909",
            city: "Madrid",
            country: "España",
        },

        photo: "/employees/mariano-camarero.webp",

        companyLogo: "/companies/serveo/logo.png",
        includeWebsiteInVCard: false,
    },
    {
        id: "jose-eugenio-del-castillo",
        companySlug: "diputacion-de-toledo",
        company: "Diputación de Toledo",

        firstName: "José Eugenio",
        lastName: "del Castillo Fernández-Pacheco",
        fullName: "José Eugenio del Castillo Fernández-Pacheco",

        position: "Diputado delegado",
        department: "Contratación y Patrimonio",

        phone: "+34660744985",
        phoneDisplay: "660 74 49 85",

        email: "jedelcastillo@diputoledo.es",

        address: {
            street: "Plaza de la Merced, 4",
            postalCode: "",
            city: "Toledo",
            country: "España",
        },

        photo: "/employees/jose-eugenio-del-castillo.webp",
        companyLogo: "/companies/diputacion-de-toledo/logo.svg",

        brand: {
            color: "#0d4b40",
            dark: "#083c34",
            ink: "#0d4b40",
            tint: "#dcece8",
            tintSoft: "#edf6f3",
            highlight: "#176457",
            shadow: "13 75 64",
        },

        includeWebsiteInVCard: false,
    },
];
