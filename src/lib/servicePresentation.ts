export interface ServicePresentationData {
    statusNeutral?: boolean;
    fearAddressed?: string[];
    confidence?: "verified" | "community-confirmed" | "legacy" | "unverified" | "seasonal";
    walkIn?: boolean;
    appointmentRequired?: boolean;
    idRequired?: boolean;
    insuranceRequired?: boolean;
    petsAllowed?: boolean;
    veteranOnly?: boolean;
    soberRequired?: boolean;
    reachableWithoutCar?: boolean;
    languages?: string[];
    states?: string[];
    genderRestrictions?: string;
    ageRestrictions?: string;
}

const concernSentences: Record<string, string> = {
    police: "Police are not dispatched by this service.",
    immigration: "The service does not report people to immigration authorities.",
    holds: "Calling does not by itself result in a psychiatric hold.",
    religion: "There is no religious requirement.",
    sobriety: "You do not have to be sober to ask for help.",
    pets: "Pets are allowed.",
    separation: "Families and couples are not separated.",
    paperwork: "You do not need ID or other paperwork to ask for help.",
    reporting: "What you share is kept confidential and is not reported.",
    cost: "There is no charge for this service."
};

const concernSentencesEs: Record<string, string> = {
    police: "Este servicio no envía a la policía.",
    immigration: "El servicio no reporta a las personas a las autoridades migratorias.",
    holds: "La llamada por sí sola no causa una retención psiquiátrica.",
    religion: "No hay requisito religioso.",
    sobriety: "No se exige sobriedad para pedir ayuda.",
    pets: "Se permiten mascotas.",
    separation: "No se separa a las familias ni a las parejas.",
    paperwork: "No necesita identificación ni otros documentos para pedir ayuda.",
    reporting: "Lo que comparta es confidencial y no se reporta.",
    cost: "Este servicio no tiene costo."
};

const languageNamesEs: Record<string, string> = {
    English: "inglés",
    Spanish: "español",
    Arabic: "árabe",
    Dari: "darí",
    Pashto: "pastún",
    French: "francés",
    Swahili: "suajili",
    Vietnamese: "vietnamita",
    Somali: "somalí",
    ASL: "lengua de señas estadounidense",
    "interpreter on call": "interpretación disponible",
    "Spanish on request": "español previa solicitud",
    "100+ via interpreter": "más de 100 mediante intérprete",
    "240+ via interpreter": "más de 240 mediante intérprete",
    "interpreters on call": "interpretación disponible",
    Inglés: "inglés",
    Español: "español",
    "Español por solicitud": "español previa solicitud",
    Vietnamita: "vietnamita",
    Somalí: "somalí",
    Árabe: "árabe",
    "100+ idiomas": "más de 100 idiomas",
    "240+ por intérprete": "más de 240 mediante intérprete"
};

function naturalList(values: string[]): string {
    if (values.length < 2) return values[0] ?? "";
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function naturalListEs(values: string[]): string {
    if (values.length < 2) return values[0] ?? "";
    if (values.length === 2) return `${values[0]} y ${values[1]}`;
    return `${values.slice(0, -1).join(", ")} y ${values.at(-1)}`;
}

function asSentence(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function buildPracticalNotes(data: ServicePresentationData, locale: "en" | "es" = "en"): string[] {
    const notes: string[] = [];

    if (locale === "es") {
        if (data.states?.length) {
            const stateNames = data.states.map((state) => state === "MO" ? "Misuri" : state === "KS" ? "Kansas" : state);
            notes.push(`Atiende a personas en ${naturalListEs(stateNames)}.`);
        }

        if (data.languages?.length) {
            const languages = data.languages.map((language) => languageNamesEs[language] ?? language);
            notes.push(`Hay atención en ${naturalListEs(languages)}.`);
        }

        if (data.statusNeutral) notes.push("No necesita documentos de estatus migratorio para pedir ayuda.");
        if (data.walkIn) notes.push("Se aceptan visitas sin cita.");
        if (data.appointmentRequired) notes.push("Haga una cita antes de ir.");
        if (data.idRequired) notes.push("Se requiere identificación.");
        if (data.insuranceRequired) notes.push("Se requiere seguro médico.");
        if (data.veteranOnly) notes.push("Este servicio es para veteranos.");
        if (data.soberRequired) notes.push("Debe estar sobrio para usar este servicio.");
        if (data.petsAllowed) notes.push("Se permiten mascotas.");
        if (data.reachableWithoutCar) notes.push("Puede llegar a este servicio sin automóvil.");
        if (data.genderRestrictions) notes.push(asSentence(data.genderRestrictions));
        if (data.ageRestrictions) notes.push(asSentence(data.ageRestrictions));

        for (const concern of data.fearAddressed ?? []) {
            const sentence = concernSentencesEs[concern];
            if (sentence) notes.push(sentence);
        }

        if (data.confidence === "community-confirmed") {
            notes.push("Llame antes para confirmar el horario actual.");
        } else if (data.confidence === "legacy" || data.confidence === "unverified") {
            notes.push("Llame antes de depender de esta información; los detalles pueden haber cambiado.");
        } else if (data.confidence === "seasonal") {
            notes.push("Este servicio es de temporada; llame o consulte el sitio web para conocer las fechas actuales.");
        }

        return [...new Set(notes.filter(Boolean))];
    }

    if (data.states?.length) {
        const stateNames = data.states.map((state) => state === "MO" ? "Missouri" : state === "KS" ? "Kansas" : state);
        notes.push(`Serves people in ${naturalList(stateNames)}.`);
    }

    if (data.languages?.length) {
        notes.push(`Help is available in ${naturalList(data.languages)}.`);
    }

    if (data.statusNeutral) notes.push("You do not need immigration-status documents to ask for help.");
    if (data.walkIn) notes.push("Walk-ins are welcome.");
    if (data.appointmentRequired) notes.push("Make an appointment before you go.");
    if (data.idRequired) notes.push("ID is required.");
    if (data.insuranceRequired) notes.push("Insurance is required.");
    if (data.veteranOnly) notes.push("This service is for veterans.");
    if (data.soberRequired) notes.push("You must be sober to use this service.");
    if (data.petsAllowed) notes.push("Pets are allowed.");
    if (data.reachableWithoutCar) notes.push("You can reach this service without a car.");
    if (data.genderRestrictions) notes.push(asSentence(data.genderRestrictions));
    if (data.ageRestrictions) notes.push(asSentence(data.ageRestrictions));

    for (const concern of data.fearAddressed ?? []) {
        const sentence = concernSentences[concern];
        if (sentence) notes.push(sentence);
    }

    if (data.confidence === "community-confirmed") {
        notes.push("Call ahead to confirm the current schedule before you go.");
    } else if (data.confidence === "legacy" || data.confidence === "unverified") {
        notes.push("Call before relying on this listing; details may have changed.");
    } else if (data.confidence === "seasonal") {
        notes.push("This service operates seasonally; call or check the website for current dates.");
    }

    return [...new Set(notes.filter(Boolean))];
}

export function publicServiceData(data: Record<string, unknown>): Record<string, unknown> {
    const {
        confidence,
        lastKnownGood: _lastKnownGood,
        statusNeutral,
        fearAddressed,
        ...publicFields
    } = data;

    const presentation = {
        ...publicFields,
        immigrationDocumentsRequired: statusNeutral === true ? false : null,
        practicalNotes: buildPracticalNotes({
            ...(data as ServicePresentationData),
            confidence: confidence as ServicePresentationData["confidence"],
            statusNeutral: statusNeutral === true,
            fearAddressed: Array.isArray(fearAddressed) ? fearAddressed.map(String) : []
        })
    };

    return presentation;
}
