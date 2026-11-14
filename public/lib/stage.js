// Homepage stage: the frame holds still while the page scrolls, and the
// statement in it changes with scroll position, crossfading in place.
// Static module because the site CSP allows only same-origin script files.
//
// Without this file the statements render one after another as ordinary
// content. With it, [data-stage] gets .stage--live, the frame pins, and
// [data-active] marks the current statement.

const stage = document.querySelector("[data-stage]");

if (stage) {
    const slides = Array.from(stage.querySelectorAll(".stage__slide"));
    const track = stage.querySelector(".stage__track");
    const index = stage.querySelector(".stage__index");
    const items = index ? Array.from(index.querySelectorAll("[data-goto]")) : [];
    const jumps = Array.from(stage.querySelectorAll("[data-goto]"));
    const count = slides.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    stage.classList.add("stage--live");

    // The frame is sized around the header and footer (see global.css). When
    // all three fit with the frame keeping at least two thirds of the screen,
    // .stage--fit holds the header and footer still, so the homepage is one
    // screen and scrolling only moves through the statements.
    const header = document.querySelector(".site-header");
    const footer = document.querySelector(".site-footer");
    const fit = () => {
        const headerHeight = header ? header.offsetHeight : 0;
        const footerHeight = footer ? footer.offsetHeight : 0;
        stage.style.setProperty("--stage-header", `${headerHeight}px`);
        stage.style.setProperty("--stage-footer", `${footerHeight}px`);
        const room = window.innerHeight - headerHeight - footerHeight;
        stage.classList.toggle("stage--fit", room >= window.innerHeight * (2 / 3));
    };
    fit();
    if ("ResizeObserver" in window) {
        const watch = new ResizeObserver(() => { fit(); measure(); });
        if (header) watch.observe(header);
        if (footer) watch.observe(footer);
    }
    stage.style.setProperty("--stage-steps", String(count));
    if (index) index.hidden = false;

    let current = -1;
    let queued = false;

    // One step between each pair of statements; the last arrives at the end.
    const stepLength = () => track.offsetHeight / Math.max(1, count - 1);
    const frame = stage.querySelector(".stage__frame");
    // Scroll position where the frame pins: the stage's top, less the frame's
    // sticky offset (the header's height when .stage--fit holds it still).
    const pinStart = () =>
        stage.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(frame).top) || 0);

    function show(step) {
        if (step === current) return;
        current = step;
        stage.dataset.active = String(step);
        slides.forEach((slide, position) => {
            if (position === step) slide.setAttribute("data-active", "");
            else slide.removeAttribute("data-active");
        });
        items.forEach((item) => {
            const target = Number(item.dataset.goto);
            if (target === step) item.setAttribute("aria-current", "step");
            else item.removeAttribute("aria-current");
        });
    }

    function measure() {
        queued = false;
        const offset = window.scrollY - pinStart();
        const progress = Math.min(1, Math.max(0, offset / (track.offsetHeight || 1)));
        stage.style.setProperty("--stage-progress", progress.toFixed(4));
        const step = Math.min(count - 1, Math.max(0, Math.round(offset / stepLength())));
        show(step);
    }

    function goTo(step, smooth) {
        const top = pinStart() + step * stepLength();
        window.scrollTo({ top, behavior: smooth && !reduce.matches ? "smooth" : "auto" });
    }

    window.addEventListener("scroll", () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(measure);
    }, { passive: true });

    window.addEventListener("resize", () => { fit(); measure(); });

    // The index and the two halves of the tagline both jump to their statement.
    jumps.forEach((item) => {
        item.addEventListener("click", () => goTo(Number(item.dataset.goto), true));
    });

    // Arrow keys step through the statements while the stage is on screen.
    document.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target;
        if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        const offset = window.scrollY - pinStart();
        if (offset < -1 || offset > track.offsetHeight + 1) return;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            if (current >= count - 1) return;
            event.preventDefault();
            goTo(current + 1, true);
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            if (current <= 0) return;
            event.preventDefault();
            goTo(current - 1, true);
        }
    });

    // A keyboard user tabbing into a statement that is not showing brings it up.
    slides.forEach((slide, position) => {
        slide.addEventListener("focusin", () => {
            if (position !== current) goTo(position, false);
        });
    });

    measure();
}
