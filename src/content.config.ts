import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sharedFields = {
    title: z.string(),
    summary: z.string().optional(),
    published: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),

    status: z.enum([
        "draft",
        "active",
        "archived",
        "historical"
    ]).default("active"),

    tags: z.array(z.string()).default([]),
    authors: z.array(z.string()).default(["Means+Measures"]),

    canonical: z.string().optional(),
    website: z.string().optional(),
    source: z.string().optional(),
    agency: z.string().optional(),
    docket: z.string().optional(),
    submitted: z.coerce.date().optional()
};

const research = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/research"
    }),

    schema: z.object({
        ...sharedFields
    })
});

const artifacts = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/artifacts"
    }),

    schema: z.object({
        ...sharedFields,

        artifactType: z.enum([
            "pdf",
            "comment",
            "analysis",
            "dataset",
            "memorandum",
            "submission",
            "record"
        ])
    })
});

const work = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/work"
    }),

    schema: z.object({
        ...sharedFields,

        initiative: z.string().optional()
    })
});

const kcServices = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/kc-services"
    }),

    schema: z.object({
        name: z.string(),
        categories: z.array(z.enum([
            "crisis", "food", "housing", "healthcare", "legal", "utilities",
            "mental-health", "immigration", "reentry", "domestic-violence",
            "youth", "seniors", "veterans", "lgbtq", "transit", "government"
        ])),
        phone: z.string().optional(),
        sms: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        hours: z.string().optional(),
        hours24: z.boolean().default(false),
        lateNight: z.boolean().default(false),
        languages: z.array(z.string()).default(["English"]),
        states: z.array(z.enum(["MO", "KS"])).default(["MO", "KS"]),
        counties: z.array(z.string()).optional(),
        statusNeutral: z.boolean().default(false),
        eligibility: z.string().optional(),
        expect: z.string().optional(),
        fearAddressed: z.array(z.enum([
            "police", "immigration", "holds", "religion", "sobriety",
            "pets", "separation", "paperwork", "reporting", "cost"
        ])).default([]),
        confidence: z.enum([
            "verified", "community-confirmed", "legacy", "unverified", "seasonal"
        ]).default("unverified"),
        lastKnownGood: z.string().optional(),
        walkIn: z.boolean().optional(),
        appointmentRequired: z.boolean().optional(),
        referralRequired: z.boolean().optional(),
        idRequired: z.boolean().optional(),
        insuranceRequired: z.boolean().optional(),
        moResidentRequired: z.boolean().optional(),
        ksResidentRequired: z.boolean().optional(),
        veteranOnly: z.boolean().optional(),
        genderRestrictions: z.string().optional(),
        ageRestrictions: z.string().optional(),
        familyFriendly: z.boolean().optional(),
        couplesAllowed: z.boolean().optional(),
        petsAllowed: z.boolean().optional(),
        wheelchairAccessible: z.boolean().optional(),
        soberRequired: z.boolean().optional(),
        nearestBusRoute: z.string().optional(),
        nearestMAXStop: z.string().optional(),
        reachableWithoutCar: z.boolean().optional(),
        transitNote: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        emergency: z.boolean().default(false),
        audioClip: z.string().optional(),
        petFriendly: z.boolean().optional()
    })
});

export const collections = {
    research,
    artifacts,
    work,
    kcServices
};
