// Site finder: a small routing aid. Type a need or a name, get the page.
// Plain ES module with no dependencies; served as a static file because the
// site's Content-Security-Policy allows only same-origin script files.
//
// Markup contract (see src/components/SiteFinder.astro):
//   [data-finder]                 root
//   [data-finder-input]           text input, role=combobox
//   [data-finder-list]            results list, role=listbox
//   [data-finder-status]          polite live region
// The page works without this file: the form submits to the site map.

const CRISIS_WORDS = [
    "crisis", "emergency", "suicide", "suicidal", "988", "911", "danger", "unsafe",
    "hurt", "abuse", "abused", "violence", "overdose", "kill", "die", "dying",
    "emergencia", "peligro", "suicidio", "urgente"
];

// Words that carry no routing meaning on their own.
const STOP_WORDS = new Set([
    "a", "an", "and", "the", "of", "in", "on", "for", "to", "is", "am", "are", "i", "im", "me", "my",
    "we", "our", "you", "your", "it", "do", "does", "can", "how", "what", "where", "who", "with",
    "need", "want", "find", "get", "some", "please", "about", "or",
    "el", "la", "los", "las", "de", "un", "una", "y", "en", "para", "necesito", "quiero"
]);

const KIND_LABELS = {
    page: "Page",
    kc: "Kansas City",
    service: "KC service",
    record: "Record",
    work: "Work",
    research: "Research"
};

export function normalize(text) {
    return String(text ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9+]+/g, " ")
        .trim();
}

function prepare(entry) {
    return {
        entry,
        label: normalize(entry.label),
        keywords: normalize(entry.keywords),
        note: normalize(entry.note)
    };
}

// Score one query token against one prepared entry. Whole-word and
// word-prefix matches count; mid-word matches do not, so "art" finds
// Artifacts but not "department".
function tokenScore(token, item) {
    const fields = [[item.label, 6], [item.keywords, 3], [item.note, 2]];
    let best = 0;

    for (const [text, weight] of fields) {
        if (!text) continue;
        const words = text.split(" ");
        for (const word of words) {
            if (word === token) best = Math.max(best, weight * 2);
            else if (token.length >= 3 && word.startsWith(token)) best = Math.max(best, weight);
        }
    }

    return best;
}

export function isCrisisQuery(query) {
    const tokens = normalize(query).split(" ");
    return tokens.some((token) => CRISIS_WORDS.includes(token));
}

export function rank(query, entries, limit = 7) {
    const all = normalize(query).split(" ").filter(Boolean);
    if (all.length === 0) return [];

    const meaningful = all.filter((token) => !STOP_WORDS.has(token));
    const tokens = meaningful.length > 0 ? meaningful : all;
    const crisis = isCrisisQuery(query);
    const scored = [];

    for (const entry of entries) {
        const item = entry.__prepared ?? (entry.__prepared = prepare(entry));
        let total = 0;
        let matched = 0;

        for (const token of tokens) {
            const score = tokenScore(token, item);
            if (score > 0) matched += 1;
            total += score;
        }

        // A crisis query always surfaces the crisis pages, whatever else it says.
        const pinned = crisis && entry.urgent && entry.kind === "kc";
        if (matched === 0 && !pinned) continue;

        if (item.label === tokens.join(" ")) total += 20;
        if (crisis && entry.urgent) total += pinned ? 200 : 60;
        if (pinned && !entry.lang) total += 10;

        scored.push({ entry, total, full: matched === tokens.length || pinned });
    }

    // If anything answers the whole query, partial matches are noise.
    const complete = scored.filter((result) => result.full);
    const pool = complete.length > 0 ? complete : scored;

    pool.sort((a, b) => b.total - a.total || a.entry.label.localeCompare(b.entry.label));
    return pool.slice(0, limit).map((result) => result.entry);
}

let indexPromise;

function loadIndex() {
    indexPromise ??= fetch("/find.json", { headers: { accept: "application/json" } })
        .then((response) => {
            if (!response.ok) throw new Error(`find.json ${response.status}`);
            return response.json();
        })
        .then((data) => data.entries)
        .catch((error) => {
            indexPromise = undefined;
            throw error;
        });
    return indexPromise;
}

function setup(root) {
    const input = root.querySelector("[data-finder-input]");
    const list = root.querySelector("[data-finder-list]");
    const status = root.querySelector("[data-finder-status]");
    const form = root.querySelector("form");
    if (!input || !list) return;

    let results = [];
    let active = -1;
    let sequence = 0;

    const optionId = (index) => `${list.id}-option-${index}`;

    function setActive(index) {
        active = index;
        list.querySelectorAll("[role='option']").forEach((option, position) => {
            option.setAttribute("aria-selected", position === index ? "true" : "false");
        });
        if (index >= 0) {
            input.setAttribute("aria-activedescendant", optionId(index));
            document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
        } else {
            input.removeAttribute("aria-activedescendant");
        }
    }

    function render(query) {
        list.replaceChildren();
        const open = query.trim().length > 0;

        list.hidden = !open;
        input.setAttribute("aria-expanded", open ? "true" : "false");

        if (!open) {
            if (status) status.textContent = "";
            setActive(-1);
            return;
        }

        results.forEach((entry, index) => {
            const option = document.createElement("li");
            option.id = optionId(index);
            option.setAttribute("role", "option");
            option.className = "finder__option";
            if (entry.urgent) option.dataset.urgent = "true";

            const link = document.createElement("a");
            link.href = entry.href;
            link.tabIndex = -1;
            if (entry.lang) link.lang = entry.lang;

            const label = document.createElement("span");
            label.className = "finder__option-label";
            label.textContent = entry.label;
            link.append(label);

            if (entry.note) {
                const note = document.createElement("span");
                note.className = "finder__option-note";
                note.textContent = entry.note;
                link.append(note);
            }

            const kind = document.createElement("span");
            kind.className = "finder__option-kind";
            kind.textContent = KIND_LABELS[entry.kind] ?? "";
            link.append(kind);

            option.append(link);
            list.append(option);
        });

        if (results.length === 0) {
            const empty = document.createElement("li");
            empty.className = "finder__empty";
            empty.setAttribute("role", "presentation");
            empty.append("Nothing by that name. ");
            const all = document.createElement("a");
            all.href = "/sitemap";
            all.textContent = "See every page";
            const contact = document.createElement("a");
            contact.href = "/contact";
            contact.textContent = "ask us";
            empty.append(all, " or ", contact, ".");
            list.append(empty);
        }

        if (status) {
            status.textContent = results.length === 0
                ? "No matches."
                : `${results.length} ${results.length === 1 ? "match" : "matches"}. Use the arrow keys to choose.`;
        }

        setActive(results.length > 0 ? 0 : -1);
    }

    async function update() {
        const query = input.value;
        const ticket = ++sequence;

        if (!query.trim()) {
            results = [];
            render(query);
            return;
        }

        try {
            const entries = await loadIndex();
            if (ticket !== sequence) return;
            results = rank(query, entries);
            render(query);
        } catch {
            // Index unavailable: leave the form to submit to the site map.
            if (status) status.textContent = "Search is unavailable. Press Enter for the full site map.";
        }
    }

    input.addEventListener("focus", () => { loadIndex().catch(() => {}); }, { once: true });
    input.addEventListener("input", update);

    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (results.length === 0) return;
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((active + step + results.length) % results.length);
        } else if (event.key === "Escape" && input.value) {
            // First Escape clears the query; a second one reaches the dialog.
            event.preventDefault();
            event.stopPropagation();
            input.value = "";
            update();
        }
    });

    form?.addEventListener("submit", (event) => {
        const target = results[active] ?? results[0];
        if (target) {
            event.preventDefault();
            window.location.assign(target.href);
        }
    });
}

function setupDialog() {
    const dialog = document.querySelector("[data-finder-dialog]");
    const opener = document.querySelector("[data-finder-open]");
    if (!dialog || !opener || typeof dialog.showModal !== "function") return;

    const open = () => {
        if (dialog.open) return;
        dialog.showModal();
        dialog.querySelector("[data-finder-input]")?.focus();
    };

    opener.hidden = false;
    opener.addEventListener("click", open);
    dialog.querySelector("[data-finder-close]")?.addEventListener("click", () => dialog.close());

    // Click on the backdrop closes.
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => opener.focus());

    // "/" opens the finder from anywhere, unless the person is typing.
    document.addEventListener("keydown", (event) => {
        if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
        const target = event.target;
        if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
        event.preventDefault();
        const inline = document.querySelector("[data-finder='inline'] [data-finder-input]");
        if (inline && inline.getClientRects().length > 0 && isInViewport(inline)) inline.focus();
        else open();
    });
}

function isInViewport(element) {
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight;
}

if (typeof document !== "undefined") {
    document.documentElement.classList.add("has-finder");
    document.querySelectorAll("[data-finder]").forEach(setup);
    setupDialog();
}
