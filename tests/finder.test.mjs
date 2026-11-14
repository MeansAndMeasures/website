import assert from "node:assert/strict";
import { test } from "node:test";
import { rank, isCrisisQuery, normalize } from "../public/lib/finder.js";

const entries = [
    { href: "/kc/crisis", label: "Need help now", kind: "kc", urgent: true, keywords: "crisis emergency suicide 988" },
    { href: "/es/kc/crisis", label: "Necesito ayuda ahora", kind: "kc", lang: "es", urgent: true, keywords: "crisis emergencia" },
    { href: "/kc/food", label: "Food", kind: "kc", note: "Pantries, meals, food tonight", keywords: "hungry eat pantry" },
    { href: "/es/kc/food", label: "Comida", kind: "kc", lang: "es", keywords: "comida hambre" },
    { href: "/kc/housing", label: "Housing", kind: "kc", keywords: "shelter eviction evicted rent" },
    { href: "/procurement", label: "Procurement", kind: "page", keywords: "vendor sam uei cage" },
    { href: "/capabilities", label: "Capabilities", kind: "page", keywords: "capability statement packet" },
    { href: "/artifacts", label: "Artifacts", kind: "page", keywords: "records documents" },
    { href: "/kc/directory?service=samuel-rodgers", label: "Samuel U. Rodgers Health Center", kind: "service", keywords: "healthcare" },
    { href: "/kc/directory?service=988", label: "988 Suicide and Crisis Lifeline", kind: "service", urgent: true, keywords: "crisis" }
];

const hrefs = (query) => rank(query, entries).map((entry) => entry.href);

test("a need routes to its page", () => {
    assert.equal(hrefs("food tonight")[0], "/kc/food");
    assert.equal(hrefs("I need to eat")[0], "/kc/food");
    assert.equal(hrefs("evict")[0], "/kc/housing");
    assert.equal(hrefs("capability statement")[0], "/capabilities");
});

test("crisis words pin the crisis page first, even with no other match", () => {
    assert.ok(isCrisisQuery("i want to die"));
    assert.equal(hrefs("i want to die")[0], "/kc/crisis");
    assert.equal(hrefs("suicide")[0], "/kc/crisis");
    assert.ok(hrefs("suicide").includes("/kc/directory?service=988"));
});

test("full matches exclude partial ones", () => {
    assert.deepEqual(hrefs("sam uei"), ["/procurement"]);
});

test("Spanish and accents", () => {
    assert.equal(hrefs("comida")[0], "/es/kc/food");
    assert.equal(normalize("Recién llegados"), "recien llegados");
});

test("mid-word fragments do not match", () => {
    assert.deepEqual(hrefs("facts"), []);
    assert.deepEqual(hrefs(""), []);
});
