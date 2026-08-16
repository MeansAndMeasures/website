import { getCollection } from "astro:content";
import { publicServiceData } from "./servicePresentation";
import {
  buildKcMachine,
  journeyResource,
  resourceRelationshipsFor,
  validateResourceRelationships
} from "./kcMachine";

export type CivicResource = {

  key: string;

  id: string;

  kind: string;

  collection: string;

  url: string;

  title: string;

  summary?: string;

  metadata: Record<string, unknown>;

  body: string;

  relationships: Record<string, string[]>;

};

function clean(value: unknown): Record<string, unknown> {

  return JSON.parse(JSON.stringify(value ?? {}));

}

function publicResourceData(collection: string, data: Record<string, unknown>): Record<string, unknown> {

  if (collection === "kcServices") return publicServiceData(data);

  if (collection === "work") {
    const { title, summary, initiative, website } = data;
    return { title, summary, initiative, website };
  }

  if (collection === "artifacts") {
    const { title, summary, artifactType, agency, docket, website } = data;
    return { title, summary, artifactType, agency, docket, website };
  }

  const { title, summary, website } = data;
  return { title, summary, website };

}

function resourceFromEntry(

  collection: string,

  kind: string,

  baseUrl: string,

  entry: any,

  kcMachine?: ReturnType<typeof buildKcMachine>

): CivicResource {

  const rawMetadata = clean(entry.data);
  const metadata = publicResourceData(collection, rawMetadata);

  const title =

    String(metadata.title ?? metadata.name ?? entry.id);

  const key = `${kind}/${entry.id}`;
  const serviceConnections = collection === "kcServices"
    ? kcMachine?.connectionsByService.get(entry.id) ?? []
    : [];
  const serviceJourneys = collection === "kcServices"
    ? kcMachine?.journeyIdsByService.get(entry.id) ?? []
    : [];

  if (collection === "kcServices") {
    metadata.relatedServices = serviceConnections;
    metadata.journeys = serviceJourneys.map((id) => ({
      id,
      title: kcMachine?.publicJourneys.find((journey) => journey.id === id)?.title ?? id,
      href: `/kc/journeys/${id}`
    }));
  }

  const relationships = collection === "kcServices"
    ? {
        related: serviceConnections.map((connection) => `kc-service/${connection.serviceSlug}`),
        journeys: serviceJourneys.map((id) => `kc-journey/${id}`)
      }
    : resourceRelationshipsFor(key);

  return {

    key,

    id: entry.id,

    kind,

    collection,

    url: `${baseUrl}/${entry.id}`,

    title,

    summary: metadata.summary

      ? String(metadata.summary)

      : metadata.expect

        ? String(metadata.expect)

        : metadata.eligibility

          ? String(metadata.eligibility)

          : undefined,

    metadata,

    body: entry.body ?? "",

    relationships

  };

}

export async function getResourceGraph() {

  const [research, artifacts, work, kcServices] = await Promise.all([

    getCollection("research"),

    getCollection("artifacts"),

    getCollection("work"),

    getCollection("kcServices")

  ]);

  const kcMachine = buildKcMachine(kcServices);

  const resources: CivicResource[] = [

    ...research.map((entry) =>

      resourceFromEntry("research", "research", "/research", entry)

    ),

    ...artifacts.map((entry) =>

      resourceFromEntry("artifacts", "artifact", "/artifacts", entry)

    ),

    ...work.map((entry) =>

      resourceFromEntry("work", "work", "/work", entry)

    ),

    ...kcServices.map((entry) =>

      resourceFromEntry("kcServices", "kc-service", "/kc/services", entry, kcMachine)

    ),

    ...kcMachine.publicJourneys.map((journey) => journeyResource(journey))

  ];

  validateResourceRelationships(resources.map((resource) => resource.key));

  const byKey = Object.fromEntries(

    resources.map((resource) => [resource.key, resource])

  );

  const byUrl = Object.fromEntries(

    resources.map((resource) => [resource.url, resource.key])

  );

  return {

    schema: "https://civicbrands.org/schemas/resource-graph.v2.json",

    count: resources.length,

    resources,

    byKey,

    byUrl

  };

}

export function resourceToJson(resource: CivicResource) {

  return JSON.stringify(resource, null, 2) + "\n";

}

export function resourceToMarkdown(resource: CivicResource) {

  const lines: string[] = [];

  lines.push(`# ${resource.title}`);

  lines.push("");

  if (resource.summary) {

    lines.push(resource.summary);

    lines.push("");

  }

  if (resource.kind === "kc-service") {

    const detailLabels: Record<string, string> = {
      phone: "Phone",
      sms: "Text",
      website: "Website",
      address: "Address",
      hours: "Hours",
      eligibility: "Who it serves",
      expect: "What to expect",
      nearestBusRoute: "Nearby transit",
      transitNote: "Getting there"
    };

    for (const [key, label] of Object.entries(detailLabels)) {
      const value = resource.metadata[key];
      if (value !== undefined && value !== null && value !== "") lines.push(`- ${label}: ${String(value)}`);
    }

    const practicalNotes = resource.metadata.practicalNotes;
    if (Array.isArray(practicalNotes) && practicalNotes.length) {
      lines.push("");
      lines.push(practicalNotes.map(String).join(" "));
    }

    const relatedServices = resource.metadata.relatedServices;
    if (Array.isArray(relatedServices) && relatedServices.length) {
      lines.push("");
      lines.push("## Also useful");
      lines.push("");
      for (const connection of relatedServices as Array<Record<string, unknown>>) {
        lines.push(`- [${String(connection.name)}](${String(connection.href)}): ${String(connection.reason)}`);
      }
    }

    const journeys = resource.metadata.journeys;
    if (Array.isArray(journeys) && journeys.length) {
      lines.push("");
      lines.push("## Routes that include this service");
      lines.push("");
      for (const journey of journeys as Array<Record<string, unknown>>) {
        lines.push(`- [${String(journey.title)}](${String(journey.href)})`);
      }
    }

    lines.push("");

  } else if (resource.kind === "kc-journey") {

    const question = resource.metadata.question;
    if (question) {
      lines.push(String(question));
      lines.push("");
    }

    const steps = resource.metadata.steps;
    if (Array.isArray(steps)) {
      steps.forEach((step, index) => {
        const value = step as Record<string, unknown>;
        lines.push(`## ${index + 1}. ${String(value.title)}`);
        lines.push("");
        lines.push(String(value.guidance));
        lines.push("");
        const services = Array.isArray(value.services) ? value.services : [];
        for (const service of services as Array<Record<string, unknown>>) {
          lines.push(`- [${String(service.name)}](${String(service.href)})`);
        }
        lines.push("");
      });
    }

  } else {

    const detailLabels: Record<string, string> = {
      initiative: "Initiative",
      website: "Live site",
      artifactType: "Material",
      agency: "Agency",
      docket: "Docket"
    };

    for (const [key, label] of Object.entries(detailLabels)) {
      const value = resource.metadata[key];
      if (value !== undefined && value !== null && value !== "") lines.push(`- ${label}: ${String(value)}`);
    }

    lines.push("");

  }

  if (resource.body.trim()) {

    lines.push("## Content");

    lines.push("");

    lines.push(resource.body.trim());

    lines.push("");

  }

  return lines.join("\n").trim() + "\n";

}

export function chooseRepresentation(accept: string | null) {

  const header = accept?.toLowerCase() ?? "";

  if (header.includes("text/markdown")) return "markdown";

  return "json";

}
