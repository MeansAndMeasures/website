// Entries for the site finder (the "Find" control in the header and on the
// homepage). This is a routing aid, not a second site map: each entry carries
// the words a person is likely to type, not a description of the page.
//
// Content collections (work, research, artifacts, KC services) are added at
// build time in src/pages/find.json.ts. Add a page here only when it is a
// place someone would ask for by name or by need.

export type FinderKind = "page" | "kc" | "service" | "record" | "work" | "research";

export interface FinderEntry {
    href: string;
    label: string;
    note?: string;
    kind: FinderKind;
    keywords?: string;
    lang?: "es";
    // Entries marked urgent are pinned first when a query uses crisis words.
    urgent?: boolean;
}

// The short standing list shown before anyone types. Order is deliberate:
// the person who needs help tonight comes before the person evaluating us.
export const standingDoors: { href: string; label: string; note: string; urgent?: boolean }[] = [
    { href: "/kc/crisis", label: "I need help now", note: "Crisis lines and emergency numbers, Kansas City metro", urgent: true },
    { href: "/kc", label: "Find help in Kansas City", note: "Food, housing, care, legal aid. Nine counties, both states" },
    { href: "/systems", label: "See what we have built", note: "The public systems, live and inspectable" },
    { href: "/artifacts", label: "Read the record", note: "Public comments, matrices, entity records" },
    { href: "/procurement", label: "Work with us", note: "Entity facts, capabilities, contact" }
];

export const staticEntries: FinderEntry[] = [
    { href: "/", label: "Home", kind: "page", keywords: "start index landing" },
    { href: "/about", label: "About Means+Measures", kind: "page", note: "Who we are and what we hold to", keywords: "who company organization mission principle equity equality history civicbrands bjl13" },
    { href: "/systems", label: "Systems", kind: "page", note: "The public infrastructure set", keywords: "products tools built infrastructure projects portfolio" },
    { href: "/capabilities", label: "Capabilities", kind: "page", note: "What Means+Measures can build", keywords: "services offer consulting capability statement packet pdf download hire" },
    { href: "/civicnavigator", label: "CivicNavigator", kind: "page", note: "Understand paperwork and find a way forward", keywords: "letter notice form paperwork benefits document help navigator mutual aid" },
    { href: "/work", label: "Work", kind: "page", note: "Representative work", keywords: "projects case examples portfolio" },
    { href: "/research", label: "Research", kind: "page", note: "Analysis and writing", keywords: "papers essays writing analysis" },
    { href: "/artifacts", label: "Artifacts", kind: "page", note: "Documents and records", keywords: "records documents public comment filings matrix" },
    { href: "/procurement", label: "Procurement", kind: "page", note: "Entity facts and engagement readiness", keywords: "vendor contract rfp rfq bid sam uei cage naics ein vosb veteran owned government buy purchase hire subcontract" },
    { href: "/contact", label: "Contact", kind: "page", note: "Email, phone, and the intake form", keywords: "email phone call message reach intake talk" },
    { href: "https://forecast.meansandmeasures.com", label: "Forecast, live", kind: "work", note: "Open the running system", keywords: "weather air quality smoke fire lightning aviation metar observations data live" },
    { href: "/updates", label: "Updates", kind: "page", note: "What changed recently", keywords: "changelog news changes recent" },
    { href: "/status", label: "Status", kind: "page", note: "Operational posture of each public surface", keywords: "down outage uptime broken working availability" },
    { href: "/brand", label: "Brand reference", kind: "page", note: "Type, color, logo, and usage", keywords: "logo colors fonts typography design system identity style guide press" },
    { href: "/sitemap", label: "Site map", kind: "page", note: "Every public page, as a plain list", keywords: "all pages list everything index" },
    { href: "/privacy", label: "Privacy", kind: "page", keywords: "data policy text messaging sms cookies tracking" },
    { href: "/terms", label: "Terms", kind: "page", keywords: "terms of use conditions" },
    { href: "/legal", label: "Legal", kind: "page", keywords: "license notices legal entity llc" },

    { href: "/kc/crisis", label: "Need help now", kind: "kc", urgent: true, note: "Crisis lines and emergency numbers", keywords: "crisis emergency suicide 988 911 danger hurt abuse violence unsafe overdose urgent help now scared" },
    { href: "/kc", label: "Kansas City resource directory", kind: "kc", note: "Nine counties, both states", keywords: "kc kansas city kck metro help resources directory services" },
    { href: "/kc/directory", label: "Search every Kansas City service", kind: "kc", note: "Filter by need, state, language, hours", keywords: "search filter list all services directory" },
    { href: "/kc/food", label: "Food", kind: "kc", note: "Pantries, meals, food tonight", keywords: "hungry eat meal pantry groceries snap ebt food stamps wic" },
    { href: "/kc/housing", label: "Housing", kind: "kc", note: "Shelter tonight, eviction, rent", keywords: "shelter sleep homeless eviction evicted rent landlord tenant housing bed" },
    { href: "/kc/healthcare", label: "Healthcare", kind: "kc", note: "Clinics, free and sliding-scale care", keywords: "doctor clinic medical sick dentist dental medicine prescription uninsured insurance hospital mental health therapy" },
    { href: "/kc/legal", label: "Legal aid", kind: "kc", note: "Free and low-cost legal help", keywords: "lawyer attorney court immigration eviction rights counsel sued" },
    { href: "/kc/veterans", label: "Veterans", kind: "kc", note: "Any discharge, any era", keywords: "veteran va military discharge service member" },
    { href: "/kc/utilities", label: "Utilities", kind: "kc", note: "Shutoffs, bills, assistance", keywords: "electric gas water bill shutoff disconnect liheap evergy spire heat" },
    { href: "/kc/transit", label: "Transit", kind: "kc", note: "Getting around without a car", keywords: "bus ride kcata streetcar transportation car" },
    { href: "/kc/libraries", label: "Libraries", kind: "kc", keywords: "library computer internet wifi printing" },
    { href: "/kc/government", label: "Government", kind: "kc", note: "Who governs what", keywords: "city county council state office agency 311" },
    { href: "/kc/property", label: "Property", kind: "kc", keywords: "home house deed land assessment owner" },
    { href: "/kc/taxes", label: "Taxes", kind: "kc", keywords: "tax property tax income tax filing vita refund" },
    { href: "/kc/newcomers", label: "New to Kansas City", kind: "kc", note: "Arriving, visiting, or resettling", keywords: "visiting new arrived immigrant refugee moved tourist" },
    { href: "/kc/journeys", label: "Step-by-step guides", kind: "kc", note: "One situation, start to finish", keywords: "guide steps how to walkthrough journey" },
    { href: "/kc/quiet-help", label: "Quiet help", kind: "kc", keywords: "private discreet confidential anonymous" },
    { href: "/kc/give-help", label: "Give help", kind: "kc", note: "Helping someone else", keywords: "volunteer donate helping friend family someone else" },
    { href: "/kc/suggest", label: "Suggest or correct a listing", kind: "kc", keywords: "wrong number closed fix correction report update suggest add" },
    { href: "/kc/use-the-data", label: "Use the Kansas City data", kind: "kc", note: "JSON, CSV, and crisis exports, free to mirror", keywords: "api json csv export download data open reuse developer mirror" },
    { href: "/kc/data", label: "Data and open records", kind: "kc", keywords: "open records sunshine request public data" },
    { href: "/kc/neighborhoods", label: "Neighborhoods", kind: "kc", keywords: "neighborhood area district where" },
    { href: "/kc/map", label: "Metro map", kind: "kc", keywords: "map counties boundaries state line" },
    { href: "/kc/about", label: "About the directory", kind: "kc", keywords: "who runs maintained independent" },

    { href: "/es/kc/crisis", label: "Necesito ayuda ahora", kind: "kc", lang: "es", urgent: true, note: "Líneas de crisis y números de emergencia", keywords: "crisis emergencia ayuda urgente peligro suicidio" },
    { href: "/es/kc/newcomers", label: "Recién llegados", kind: "kc", lang: "es", note: "Kansas City en español", keywords: "espanol español nuevo llegar inmigrante ayuda" },
    { href: "/es/kc/food", label: "Comida", kind: "kc", lang: "es", keywords: "comida hambre despensa alimentos comer" },
    { href: "/es/kc/housing", label: "Vivienda", kind: "kc", lang: "es", keywords: "vivienda refugio albergue desalojo renta alquiler dormir" },
    { href: "/es/kc/healthcare", label: "Salud", kind: "kc", lang: "es", keywords: "salud medico médico clinica clínica doctor dentista" },
    { href: "/es/kc/legal", label: "Ayuda legal", kind: "kc", lang: "es", keywords: "abogado legal corte inmigracion inmigración derechos" },
    { href: "/es/kc/journeys", label: "Guías paso a paso", kind: "kc", lang: "es", keywords: "guia guía pasos como cómo" }
];
