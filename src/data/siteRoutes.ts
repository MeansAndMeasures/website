// Page identity for the site header: which name the header shows for the
// current page, and which primary links appear beside it.
//
// The header shows where the visitor is; the navigation shows where they can
// go. So the current page (or, on a detail page, its section) is left out of
// the navigation, and its name sits beside the logo instead.
//
// A page not listed here shows no header title. A detail page (a single
// work, research, or artifact entry) passes its own title through
// BaseLayout's `pageTitle` prop, which overrides this table.

export interface NavItem {
    href: string;
    label: string;
}

export const primaryNav: NavItem[] = [
    { href: "/systems", label: "Systems" },
    { href: "/civicnavigator", label: "CivicNavigator" },
    { href: "/work", label: "Work" },
    { href: "/research", label: "Research" },
    { href: "/artifacts", label: "Artifacts" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
];

// Exact paths. The homepage is deliberately absent: its own name is the page.
const pageTitles: Record<string, string> = {
    "/about": "About",
    "/artifacts": "Artifacts",
    "/brand": "Brand",
    "/capabilities": "Capabilities",
    "/civicnavigator": "CivicNavigator",
    "/contact": "Contact",
    "/intake": "Intake",
    "/legal": "Legal",
    "/privacy": "Privacy",
    "/procurement": "Procurement",
    "/research": "Research",
    "/sitemap": "Site map",
    "/status": "Status",
    "/systems": "Systems",
    "/terms": "Terms",
    "/updates": "Updates",
    "/work": "Work"
};

// Whole sections that share one header title.
const sectionTitles: { test: (path: string) => boolean; title: string }[] = [
    { test: isKcPath, title: "Kansas City" }
];

export function normalizePath(pathname: string): string {
    return pathname.replace(/\/$/, "") || "/";
}

export function isKcPath(path: string): boolean {
    return path === "/kc" || path.startsWith("/kc/") || path === "/es/kc" || path.startsWith("/es/kc/");
}

export function headerTitleFor(pathname: string): string | undefined {
    const path = normalizePath(pathname);
    if (pageTitles[path]) return pageTitles[path];
    return sectionTitles.find((section) => section.test(path))?.title;
}

// The primary link the visitor is already in: the page itself, or the
// section a detail page belongs to (/work/psif is in /work).
export function currentNavHref(pathname: string): string | undefined {
    const path = normalizePath(pathname);
    return primaryNav.find((item) => path === item.href || path.startsWith(`${item.href}/`))?.href;
}

export function navFor(pathname: string): NavItem[] {
    const current = currentNavHref(pathname);
    return primaryNav.filter((item) => item.href !== current);
}
