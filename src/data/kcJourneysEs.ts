// Spanish translations of the journeys in ./kcMachine.ts, keyed by journey id and
// step id. Structure (ids, order, services, hrefs) always comes from kcJourneys;
// only the human-readable text lives here. Needs review by a fluent reader.

export interface KcJourneyStepEs {
    title: string;
    guidance: string;
}

export interface KcJourneyEs {
    title: string;
    question: string;
    summary: string;
    steps: Record<string, KcJourneyStepEs>;
}

// Paths that have a Spanish version today. Step links to other pages stay English.
export const kcSpanishPages = new Set([
    "/kc/crisis",
    "/kc/food",
    "/kc/healthcare",
    "/kc/housing",
    "/kc/legal",
    "/kc/newcomers",
    "/kc/worldcup"
]);

export function spanishHref(href: string): { href: string; spanish: boolean } {
    const path = href.split(/[?#]/)[0];
    if (kcSpanishPages.has(path)) return { href: `/es${href}`, spanish: true };
    return { href, spanish: false };
}

export const kcJourneysEs: Record<string, KcJourneyEs> = {
    "facing-eviction": {
        title: "Si enfrenta un desalojo",
        question: "Mi arrendador presentó una demanda, amenazó con cambiarme las cerraduras o dice que tengo que irme. ¿Qué es lo primero?",
        summary: "Empiece por la ayuda para inquilinos antes de ir a la corte o de mudarse. Después conecte las opciones legales, de renta, de servicios públicos y de vivienda del lado correcto de la línea estatal.",
        steps: {
            "tenant-help": {
                title: "Llame a la ayuda para inquilinos antes de la corte o de un cambio de cerraduras",
                guidance: "Diga dónde vive, si ya se presentó algo en la corte y la fecha que aparece en cualquier aviso."
            },
            "stabilize-bills": {
                title: "Conecte ayuda con la renta y los servicios públicos",
                guidance: "Use la opción del estado y de la empresa de servicios que corresponda; un corte ordenado por el arrendador y un corte de la empresa de servicios son problemas distintos."
            },
            "housing-route": {
                title: "Mantenga abierta una opción de vivienda",
                guidance: "Si ya no es posible quedarse, use la página de vivienda para ver refugios, vivienda pública y opciones a más largo plazo."
            }
        }
    },
    "leaving-hospital": {
        title: "Al salir de un hospital o de una visita de urgencia",
        question: "Necesito atención después del alta, medicamentos, comida o una forma de llegar a mis citas de seguimiento.",
        summary: "Lleve las instrucciones del alta a una clínica de atención continua. Luego conecte la comida y el transporte antes de que se conviertan en razones por las que falle el plan de atención.",
        steps: {
            "continuing-care": {
                title: "Organice la atención continua",
                guidance: "Dígale a la clínica qué trató el hospital, qué medicamento le recetaron y cuándo le pidieron el seguimiento."
            },
            "food-support": {
                title: "Proteja su acceso a la comida mientras se recupera",
                guidance: "Use una despensa o un servicio de comidas cercano si la recuperación, el trabajo perdido o los gastos médicos redujeron lo que tiene para comida."
            },
            "transportation": {
                title: "Planee el viaje antes de la cita",
                guidance: "Use la página de transporte para conectar la dirección de la clínica con RideKC, el paratránsito u otra ruta local."
            }
        }
    },
    "without-documents": {
        title: "Empezar sin identificación ni documentos de estatus migratorio",
        question: "Necesito ayuda, pero no tengo los documentos que creo que me pedirá una oficina.",
        summary: "Empiece con servicios que pueden ayudar sin esos documentos, recupere su identificación cuando sea posible y separe las preguntas legales del acceso ordinario a comida, atención médica y refugio.",
        steps: {
            "immediate-needs": {
                title: "Atienda las necesidades inmediatas sin esperar los documentos",
                guidance: "La comida, los servicios diurnos y la medicina de calle pueden empezar mientras el trabajo para recuperar la identificación sigue en curso."
            },
            "recover-id": {
                title: "Construya una ruta para recuperar su identificación",
                guidance: "Una dirección postal, copias de documentos, acceso a una biblioteca y la administración de casos pueden ser partes del mismo proceso de recuperación."
            },
            "legal-question": {
                title: "Use ayuda legal calificada para las preguntas de inmigración",
                guidance: "No le pague a un preparador sin calificación para presentar trámites de inmigración. Use un servicio legal del estado que corresponda."
            }
        }
    },
    "helping-outdoors": {
        title: "Ayudar a alguien que duerme afuera",
        question: "Estoy tratando de ayudar a alguien que está afuera sin enviarlo a la puerta equivocada.",
        summary: "Empiece por lo que la persona quiere hoy. Luego conecte servicios diurnos, medicina de calle, refugio o vivienda, y rutas especializadas para veteranos cuando correspondan.",
        steps: {
            "ask-first": {
                title: "Empiece por la necesidad que la persona nombra",
                guidance: "Comida, una ducha, atención médica, una llamada telefónica, recuperar documentos y un lugar para dormir son rutas distintas."
            },
            "street-care": {
                title: "Lleve la atención médica a la ruta",
                guidance: "La medicina de calle puede ayudar cuando una clínica estándar no es accesible o no funciona para la persona."
            },
            "housing-options": {
                title: "Escoja la ruta de vivienda que le sirva a la persona",
                guidance: "Pregunte directamente por necesidades de familia, jóvenes, LGBTQ, discapacidad, sobriedad, mascotas o veteranos antes de elegir un programa."
            }
        }
    }
};
