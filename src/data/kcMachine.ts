export type KcRelationshipKind = "next-step" | "alternative" | "works-with";

export interface KcServiceRelationship {
    from: string;
    to: string;
    kind: KcRelationshipKind;
    reason: string;
}

export interface KcJourneyStep {
    id: string;
    title: string;
    guidance: string;
    href: string;
    serviceSlugs: string[];
}

export interface KcJourney {
    id: string;
    title: string;
    question: string;
    summary: string;
    searchTerms: string[];
    steps: KcJourneyStep[];
}

export const kcCategorySearchTerms: Record<string, string[]> = {
    crisis: ["right now", "immediate danger", "emergency", "someone to talk to"],
    food: ["hungry", "groceries", "meal", "pantry", "food tonight", "something to eat"],
    housing: ["rent", "eviction", "landlord", "shelter", "sleep tonight", "homeless", "locked out"],
    healthcare: ["doctor", "clinic", "medicine", "medical care", "dental", "no insurance"],
    legal: ["lawyer", "court", "rights", "tenant defense", "legal help", "papers"],
    utilities: ["lights off", "power shutoff", "water bill", "gas bill", "utility help", "internet"],
    "mental-health": ["counseling", "therapy", "overwhelmed", "mental health", "psychiatric care"],
    immigration: ["immigration lawyer", "documents", "new arrival", "citizenship", "deportation"],
    reentry: ["released", "probation", "parole", "record", "job after prison"],
    "domestic-violence": ["unsafe at home", "partner violence", "protective order", "leave safely"],
    youth: ["teen", "child", "young person", "runaway", "family help"],
    seniors: ["older adult", "elder", "aging", "senior help"],
    veterans: ["veteran", "military", "discharge", "VA", "service member"],
    lgbtq: ["LGBTQ", "trans", "queer", "gender affirming"],
    transit: ["bus", "ride", "transportation", "no car", "get there"],
    government: ["city", "county", "benefits office", "public office", "311"]
};

export const kcJourneys: KcJourney[] = [
    {
        id: "facing-eviction",
        title: "Facing eviction",
        question: "My landlord filed, threatened a lockout, or says I have to leave. What comes first?",
        summary: "Start with tenant help before court or a move, then connect legal, rent, utility, and housing routes for the correct side of the state line.",
        searchTerms: ["eviction", "landlord", "lockout", "rent", "court", "notice to vacate"],
        steps: [
            {
                id: "tenant-help",
                title: "Call tenant help before court or a lockout",
                guidance: "Say where you live, whether anything has been filed in court, and the date on any notice.",
                href: "/kc/housing#eviction",
                serviceSlugs: ["kc-tenants-hotline", "kcmo-right-to-counsel", "legal-aid-wmo", "ks-legal-services"]
            },
            {
                id: "stabilize-bills",
                title: "Connect rent and utility help",
                guidance: "Use the correct state and utility route; a landlord shutoff and a utility-company shutoff are different problems.",
                href: "/kc/utilities",
                serviceSlugs: ["211-mo", "211-ks", "bishop-sullivan", "catholic-charities-mo", "catholic-charities-ks"]
            },
            {
                id: "housing-route",
                title: "Keep a housing route open",
                guidance: "If staying is no longer possible, use the housing page for shelter, public housing, and longer-term routes.",
                href: "/kc/housing",
                serviceSlugs: ["hakc", "kckha", "jcha"]
            }
        ]
    },
    {
        id: "leaving-hospital",
        title: "Leaving a hospital or urgent visit",
        question: "I need care after discharge, medication, food, or a way to get to follow-up appointments.",
        summary: "Carry the discharge instructions into a continuing-care clinic, then connect food and transportation before they become reasons the care plan fails.",
        searchTerms: ["hospital discharge", "follow-up", "medicine", "clinic", "ride to doctor"],
        steps: [
            {
                id: "continuing-care",
                title: "Set up continuing care",
                guidance: "Tell the clinic what the hospital treated, what medication was prescribed, and when follow-up was requested.",
                href: "/kc/healthcare",
                serviceSlugs: ["kc-care-clinic", "samuel-rodgers", "swope-health", "vibrant-health"]
            },
            {
                id: "food-support",
                title: "Protect food access while recovering",
                guidance: "Use a nearby pantry or meal route if recovery, missed work, or medical costs have reduced what is available for food.",
                href: "/kc/food",
                serviceSlugs: ["harvesters", "reconciliation-services", "cross-lines"]
            },
            {
                id: "transportation",
                title: "Plan the trip before the appointment",
                guidance: "Use the transit page to connect the clinic address to RideKC, paratransit, or another local route.",
                href: "/kc/transit",
                serviceSlugs: ["the-whole-person"]
            }
        ]
    },
    {
        id: "without-documents",
        title: "Starting without identification or immigration-status documents",
        question: "I need help, but I do not have the documents I think an office will ask for.",
        summary: "Begin with services that can help without those documents, recover identification where possible, and separate legal questions from ordinary access to food, care, and shelter.",
        searchTerms: ["no ID", "lost ID", "no documents", "immigration papers", "mailing address"],
        steps: [
            {
                id: "immediate-needs",
                title: "Meet immediate needs without waiting for documents",
                guidance: "Food, day services, and street medicine can begin while identification work is still underway.",
                href: "/kc/directory?immigration-documents=no",
                serviceSlugs: ["hope-faith", "care-beyond-boulevard", "reconciliation-services"]
            },
            {
                id: "recover-id",
                title: "Build an identification route",
                guidance: "A mailing address, document copies, library access, and case management can be parts of the same recovery process.",
                href: "/kc/libraries",
                serviceSlugs: ["hope-faith", "reconciliation-services", "kcpl", "mcpl"]
            },
            {
                id: "legal-question",
                title: "Use qualified legal help for immigration questions",
                guidance: "Do not pay an unqualified preparer to file immigration paperwork. Use a legal-service route for the correct state.",
                href: "/kc/legal",
                serviceSlugs: ["el-centro", "legal-aid-wmo", "ks-legal-services"]
            }
        ]
    },
    {
        id: "helping-outdoors",
        title: "Helping someone who is sleeping outside",
        question: "I am trying to help someone outdoors without sending them through the wrong door.",
        summary: "Start with what the person wants today, then connect day services, street medicine, shelter or housing, and specialized veteran routes when they apply.",
        searchTerms: ["sleeping outside", "unhoused", "street outreach", "day shelter", "help someone homeless"],
        steps: [
            {
                id: "ask-first",
                title: "Start with the need they name",
                guidance: "Food, a shower, medical care, a phone call, document recovery, and a place to sleep are different routes.",
                href: "/kc/housing#tonight",
                serviceSlugs: ["hope-faith", "reconciliation-services"]
            },
            {
                id: "street-care",
                title: "Bring healthcare into the route",
                guidance: "Street medicine can help when a standard clinic is not reachable or workable.",
                href: "/kc/healthcare",
                serviceSlugs: ["care-beyond-boulevard", "access-kc"]
            },
            {
                id: "housing-options",
                title: "Match the housing route to the person",
                guidance: "Ask directly about family, youth, LGBTQ, disability, sobriety, pets, or veteran needs before choosing a program.",
                href: "/kc/housing",
                serviceSlugs: ["restart-inc", "sheffield-place", "vcp-kc"]
            }
        ]
    }
];

export const kcServiceRelationships: KcServiceRelationship[] = [
    { from: "kc-tenants-hotline", to: "kcmo-right-to-counsel", kind: "next-step", reason: "If you live inside Kansas City, Missouri and face eviction, ask about free representation." },
    { from: "kc-tenants-hotline", to: "legal-aid-wmo", kind: "alternative", reason: "For civil legal help elsewhere in western Missouri, use Legal Aid of Western Missouri." },
    { from: "kcmo-right-to-counsel", to: "legal-aid-wmo", kind: "alternative", reason: "If you live outside Kansas City, Missouri city limits, ask Legal Aid about the correct housing route." },
    { from: "ks-legal-services", to: "211-ks", kind: "works-with", reason: "211 Kansas can connect legal work with Kansas-side rent, food, and utility help." },
    { from: "legal-aid-wmo", to: "211-mo", kind: "works-with", reason: "211 Missouri can connect legal work with Missouri-side rent, food, and utility help." },
    { from: "hope-faith", to: "reconciliation-services", kind: "works-with", reason: "Reconciliation Services also offers meals, document recovery, and case management." },
    { from: "hope-faith", to: "care-beyond-boulevard", kind: "works-with", reason: "Street medicine can add medical and psychiatric care without requiring an address or insurance." },
    { from: "care-beyond-boulevard", to: "kc-care-clinic", kind: "next-step", reason: "KC Care can provide continuing primary, dental, behavioral, pharmacy, HIV, and gender-affirming care." },
    { from: "care-beyond-boulevard", to: "vibrant-health", kind: "next-step", reason: "On the Kansas side, Vibrant Health provides continuing primary, dental, and behavioral care." },
    { from: "truman-medical", to: "kc-care-clinic", kind: "next-step", reason: "KC Care is one route for continuing outpatient care after an urgent or hospital visit." },
    { from: "truman-medical", to: "swope-health", kind: "alternative", reason: "Swope Health is another continuing-care route with multiple locations and pharmacy services." },
    { from: "reconciliation-services", to: "hope-faith", kind: "works-with", reason: "Hope Faith adds showers, laundry, a mailing address, and day services." },
    { from: "restart-inc", to: "hope-faith", kind: "works-with", reason: "Hope Faith provides weekday day services while shelter or housing intake is underway." },
    { from: "211-mo", to: "211-ks", kind: "alternative", reason: "If the service need is on the Kansas side, 211 Kansas uses a separate intake and service database." },
    { from: "211-ks", to: "211-mo", kind: "alternative", reason: "If the service need is on the Missouri side, 211 Missouri uses a separate intake and service database." },
    { from: "vcp-kc", to: "kc-vet-center", kind: "works-with", reason: "The KC Vet Center offers separate, confidential readjustment counseling for veterans and families." },
    { from: "veterans-crisis-line", to: "vcp-kc", kind: "next-step", reason: "After immediate crisis support, Veterans Community Project can help with housing, IDs, benefits, and basic needs." },
    { from: "el-centro", to: "ks-legal-services", kind: "works-with", reason: "Kansas Legal Services can add civil legal help on the Kansas side." },
    { from: "mattie-rhodes", to: "legal-aid-wmo", kind: "works-with", reason: "Legal Aid can add Missouri-side civil legal help when a family or immigration matter also involves housing, benefits, or court." },
    { from: "the-whole-person", to: "connections-to-success", kind: "works-with", reason: "Connections to Success offers cohort-based employment and life-skills support when reentry is also part of the situation." }
];

export const civicResourceRelationships: Record<string, Record<string, string[]>> = {
    "work/forecast": {
        related: ["research/situated-inference"]
    },
    "work/open-cognition": {
        related: ["research/abstraction-harm", "artifact/entity-records", "artifact/record-sufficiency-matrix"]
    },
    "research/abstraction-harm": {
        appliedBy: ["work/open-cognition", "artifact/record-sufficiency-matrix"]
    },
    "research/situated-inference": {
        appliedBy: ["work/forecast", "artifact/record-sufficiency-matrix"]
    },
    "artifact/record-sufficiency-matrix": {
        informedBy: ["research/abstraction-harm", "research/situated-inference"]
    }
};

export const kcCoverageDomains = [
    "crisis",
    "food",
    "housing",
    "healthcare",
    "legal",
    "utilities",
    "mental-health",
    "immigration",
    "reentry",
    "domestic-violence",
    "youth",
    "seniors",
    "veterans",
    "lgbtq",
    "transit",
    "government",
    "employment",
    "childcare",
    "disability",
    "document-recovery",
    "education",
    "funeral-assistance",
    "digital-access"
] as const;
