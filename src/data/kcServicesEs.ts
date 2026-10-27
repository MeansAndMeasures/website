// Spanish strings for KC services, copied verbatim from the existing Spanish
// pages (src/pages/es/kc/*.astro) so the Spanish journey pages reuse reviewed copy.
// Services without an entry here fall back to the structured, already-localized
// practical notes only (see ServiceCard / buildPracticalNotes) plus a pointer to
// the English listing; their English hours/expect text is deliberately not shown
// on Spanish pages.

export interface KcServiceEs {
    name?: string;
    hours?: string;
    expect?: string;
}

export const kcServicesEs: Record<string, KcServiceEs> = {
    "kc-tenants-hotline": { name: "Línea telefónica de KC Tenants", hours: "Línea atendida en horario laboral; mensajes devueltos", expect: "Organización dirigida por inquilinos. Conozca sus derechos, navegue la corte, conéctese con asesoría legal. Empujaron a KCMO a aprobar el Derecho a Abogado y la Carta de Derechos del Inquilino." },
    "kcmo-right-to-counsel": { name: "Oficina de Defensa del Inquilino de KCMO / Derecho a Abogado", hours: "Horario laboral, L-V", expect: "Representación legal gratuita en desalojo — pero solo si vive dentro de los límites de la ciudad de KCMO. Inquilinos de KCMO con ingresos elegibles tienen derecho a un abogado. Independence, Lee's Summit, Liberty NO están cubiertos." },
    "legal-aid-wmo": { name: "Legal Aid of Western Missouri", hours: "Horario laboral, L-V", expect: "Representación legal para personas con ingresos elegibles — vivienda, familia, beneficios públicos. No requiere estatus migratorio para tomar el caso." },
    "ks-legal-services": { name: "Kansas Legal Services", hours: "Horario laboral, L-V", expect: "Representación legal para personas con ingresos elegibles del lado de Kansas. Defensa de inquilinos, derecho familiar, beneficios públicos." },
    "211-mo": { name: "211 Missouri", hours: "24/7", expect: "Marque 211 en Missouri. Línea directa: 816-474-5112. Referencias para comida, renta, servicios públicos, salud mental." },
    "211-ks": { name: "211 Kansas", hours: "Teléfono 24/7 · SMS lunes-viernes 7am-7pm", expect: "Marque 211 en Kansas. Para mensaje de texto envíe su código postal al 898-211 — esa línea solo en días laborables." },
    "kc-care-clinic": { name: "KC Care Health Center", hours: "Múltiples sucursales; varía", expect: "FQHC. Atención primaria, salud conductual, dental, farmacia, atención de VIH, atención afirmativa de género. Escala móvil." },
    "samuel-rodgers": { name: "Samuel U. Rodgers Health Center", hours: "Múltiples sucursales; varía", expect: "FQHC que sirve al noreste de KCMO. Atención primaria, dental, OB/GIN, salud conductual. Fuerte acceso al idioma (vietnamita, somalí, árabe, más)." },
    "swope-health": { name: "Swope Health", hours: "Múltiples sucursales; varía", expect: "FQHC. Atención primaria, salud conductual, dental, farmacia, servicios para mujeres. Múltiples ubicaciones en ambos estados." },
    "harvesters": { name: "Localizador de despensas Harvesters", hours: "El localizador está en línea 24/7; las despensas varían", expect: "Use el localizador en harvesters.org — ingrese su código postal y vea qué está abierto. Harvesters provee a la mayoría de las despensas del área. Cada despensa fija sus propias reglas; la mayoría requiere papeles mínimos." },
    "reconciliation-services": { name: "Thelma's Kitchen / Reconciliation Services", hours: "Almuerzo de lunes a viernes; despensa con cita", expect: "Almuerzo caliente con pago según pueda. Nadie es rechazado por falta de dinero. La despensa sirve a los vecindarios del corredor Linwood/Troost. También ofrece salud mental, recuperación de identificación y administración de casos." },
    "hope-faith": { name: "Hope Faith", hours: "Servicios diurnos 7am-3pm L-V", expect: "Refugio diurno, dirección postal, duchas, lavandería, comida, recuperación de identificación, administración de casos. No es para pernoctar. Entre sin cita. No requieren identificación para recibir servicios." },
    "care-beyond-boulevard": { name: "Care Beyond the Boulevard", hours: "40+ clínicas al mes, ubicaciones rotativas en ambos estados", expect: "Llame para el horario actual. Atención médica, psiquiátrica y necesidades básicas. No requieren identificación, seguro o dirección. Construido explícitamente para personas que el sistema estándar no puede alcanzar." },
    "restart-inc": { name: "reStart, Inc.", hours: "Horarios de admisión varían — llame primero", expect: "El sistema de refugios más grande de KCMO. Tiene refugio juvenil dedicado y programas familiares. Adultos solteros: llame primero. Tienen opciones para parejas y opciones afirmativas para LGBTQ pero pregunte explícitamente al llamar." },
    // NEW translation (not copied from an existing Spanish page): translates the
    // English listing text updated on 2026-10-27 from the county page. Needs fluent review.
    jcha: {
        expect: "Programa de vales de elección de vivienda (Sección 8) del condado Johnson, KS, sin incluir la ciudad de Olathe. La lista de espera está cerrada por ahora y no hay planes de abrirla en 2026; llame antes de solicitar."
    }
};
