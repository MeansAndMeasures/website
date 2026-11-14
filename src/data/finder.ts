// Entries for the site finder (the "Find" control in the header and on the
// homepage). This is a routing aid, not a second site map: each entry carries
// the words a person is likely to type, not a description of the page.
//
// Content collections (work, research, artifacts) are added at
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

// The short standing list shown before anyone types. Company-level only:
// no single project gets a standing link.
export const standingDoors: { href: string; label: string; note: string; urgent?: boolean }[] = [
    { href: "/systems", label: "See what we have built", note: "The public systems, live and inspectable" },
    { href: "/artifacts", label: "Read the record", note: "Public comments, matrices, entity records" },
    { href: "/research", label: "Read the research", note: "Analysis and writing" },
    { href: "/procurement", label: "Work with us", note: "Entity facts, capabilities, contact" },
    { href: "/about", label: "Who we are", note: "What Means+Measures holds to" }
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

    // The Kansas City directory is one project. It gets one entry here, plus
    // the crisis page; its own pages and services are found through its own
    // search at /kc/directory, not through the company finder.
    { href: "/kc", label: "Kansas City Metro Resource Directory", kind: "work", note: "Food, housing, care, legal aid across nine counties", keywords: "kc kck directory services help resources food housing shelter healthcare clinic legal aid veterans utilities transit comida vivienda salud ayuda" },
    { href: "/kc/crisis", label: "Need help now", kind: "kc", urgent: true, note: "Crisis lines and emergency numbers, Kansas City metro", keywords: "crisis emergency suicide 988 911 danger urgent" }
];
