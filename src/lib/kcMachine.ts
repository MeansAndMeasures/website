import {
    civicResourceRelationships,
    kcCategorySearchTerms,
    kcCoverageDomains,
    kcJourneys,
    kcServiceRelationships,
    type KcJourney,
    type KcRelationshipKind
} from "../data/kcMachine";

export interface KcMachineServiceEntry {
    id: string;
    data: {
        name: string;
        categories: string[];
        [key: string]: unknown;
    };
}

export interface KcPublicConnection {
    kind: KcRelationshipKind;
    serviceSlug: string;
    name: string;
    href: string;
    reason: string;
}

export interface KcPublicJourneyStep {
    id: string;
    title: string;
    guidance: string;
    href: string;
    services: Array<{
        slug: string;
        name: string;
        href: string;
    }>;
}

export interface KcPublicJourney {
    id: string;
    title: string;
    question: string;
    summary: string;
    searchTerms: string[];
    href: string;
    steps: KcPublicJourneyStep[];
}

export interface KcCoverageRow {
    domain: string;
    services: number;
    states: string[];
    languages: string[];
    withAddress: number;
    withCoordinates: number;
    withTransitGuidance: number;
}

function assertUnique(values: string[], label: string): void {
    const seen = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
        seen.add(value);
    }
}

export function buildKcMachine(services: KcMachineServiceEntry[]) {
    const serviceBySlug = new Map(services.map((service) => [service.id, service]));
    assertUnique(services.map((service) => service.id), "KC service slug");
    assertUnique(kcJourneys.map((journey) => journey.id), "KC journey id");

    for (const journey of kcJourneys) {
        assertUnique(journey.steps.map((step) => step.id), `step id in journey ${journey.id}`);
        for (const step of journey.steps) {
            for (const slug of step.serviceSlugs) {
                if (!serviceBySlug.has(slug)) {
                    throw new Error(`KC journey ${journey.id}/${step.id} references missing service: ${slug}`);
                }
            }
        }
    }

    const relationIdentity = kcServiceRelationships.map((relationship) =>
        `${relationship.from}|${relationship.to}|${relationship.kind}`
    );
    assertUnique(relationIdentity, "KC service relationship");

    for (const relationship of kcServiceRelationships) {
        if (!serviceBySlug.has(relationship.from)) {
            throw new Error(`KC relationship references missing source service: ${relationship.from}`);
        }
        if (!serviceBySlug.has(relationship.to)) {
            throw new Error(`KC relationship references missing target service: ${relationship.to}`);
        }
        if (relationship.from === relationship.to) {
            throw new Error(`KC relationship cannot point to itself: ${relationship.from}`);
        }
    }

    const publicJourneys: KcPublicJourney[] = kcJourneys.map((journey) => ({
        ...journey,
        href: `/kc/journeys/${journey.id}`,
        steps: journey.steps.map((step) => ({
            ...step,
            services: step.serviceSlugs.map((slug) => {
                const service = serviceBySlug.get(slug)!;
                return {
                    slug,
                    name: service.data.name,
                    href: `/kc/directory?service=${encodeURIComponent(slug)}`
                };
            })
        }))
    }));

    const connectionsByService = new Map<string, KcPublicConnection[]>();
    for (const service of services) connectionsByService.set(service.id, []);
    for (const relationship of kcServiceRelationships) {
        const target = serviceBySlug.get(relationship.to)!;
        connectionsByService.get(relationship.from)!.push({
            kind: relationship.kind,
            serviceSlug: relationship.to,
            name: target.data.name,
            href: `/kc/directory?service=${encodeURIComponent(relationship.to)}`,
            reason: relationship.reason
        });
    }

    const journeyIdsByService = new Map<string, string[]>();
    for (const service of services) journeyIdsByService.set(service.id, []);
    for (const journey of kcJourneys) {
        const slugs = new Set(journey.steps.flatMap((step) => step.serviceSlugs));
        for (const slug of slugs) journeyIdsByService.get(slug)!.push(journey.id);
    }

    function searchTermsForService(service: KcMachineServiceEntry): string[] {
        const categoryTerms = service.data.categories.flatMap((category) => kcCategorySearchTerms[category] ?? []);
        const journeyTerms = publicJourneys
            .filter((journey) => journeyIdsByService.get(service.id)?.includes(journey.id))
            .flatMap((journey) => [journey.title, journey.question, ...journey.searchTerms]);
        return [...new Set([...categoryTerms, ...journeyTerms])];
    }

    function coverage(): KcCoverageRow[] {
        return kcCoverageDomains.map((domain) => {
            const matching = services.filter((service) => service.data.categories.includes(domain));
            const states = new Set<string>();
            const languages = new Set<string>();
            let withAddress = 0;
            let withCoordinates = 0;
            let withTransitGuidance = 0;

            for (const service of matching) {
                for (const state of (service.data.states as string[] | undefined) ?? []) states.add(state);
                for (const language of (service.data.languages as string[] | undefined) ?? []) languages.add(language);
                if (service.data.address) withAddress++;
                if (typeof service.data.lat === "number" && typeof service.data.lng === "number") withCoordinates++;
                if (service.data.reachableWithoutCar || service.data.nearestBusRoute || service.data.transitNote) {
                    withTransitGuidance++;
                }
            }

            return {
                domain,
                services: matching.length,
                states: [...states].sort(),
                languages: [...languages].sort(),
                withAddress,
                withCoordinates,
                withTransitGuidance
            };
        });
    }

    return {
        serviceBySlug,
        publicJourneys,
        connectionsByService,
        journeyIdsByService,
        searchTermsForService,
        coverage
    };
}

export function resourceRelationshipsFor(key: string): Record<string, string[]> {
    return civicResourceRelationships[key] ?? {};
}

export function publicMachineFields(
    machine: ReturnType<typeof buildKcMachine>,
    slug: string
): Record<string, unknown> {
    const journeyIds = machine.journeyIdsByService.get(slug) ?? [];
    return {
        relatedServices: machine.connectionsByService.get(slug) ?? [],
        journeys: journeyIds.map((id) => {
            const journey = machine.publicJourneys.find((candidate) => candidate.id === id);
            return {
                id,
                title: journey?.title ?? id,
                href: `/kc/journeys/${id}`
            };
        })
    };
}

export function validateResourceRelationships(resourceKeys: Iterable<string>): void {
    const keys = new Set(resourceKeys);
    for (const [source, groups] of Object.entries(civicResourceRelationships)) {
        if (!keys.has(source)) throw new Error(`Civic relationship references missing source resource: ${source}`);
        for (const targets of Object.values(groups)) {
            for (const target of targets) {
                if (!keys.has(target)) throw new Error(`Civic relationship references missing target resource: ${target}`);
            }
        }
    }
}

export function journeyResource(journey: KcPublicJourney) {
    return {
        key: `kc-journey/${journey.id}`,
        id: journey.id,
        kind: "kc-journey",
        collection: "kcJourneys",
        url: journey.href,
        title: journey.title,
        summary: journey.summary,
        metadata: {
            question: journey.question,
            steps: journey.steps,
            searchTerms: journey.searchTerms
        },
        body: "",
        relationships: {
            includes: [...new Set(
                journey.steps.flatMap((step) => step.services.map((service) => `kc-service/${service.slug}`))
            )]
        }
    };
}

export function journeyById(id: string): KcJourney | undefined {
    return kcJourneys.find((journey) => journey.id === id);
}
