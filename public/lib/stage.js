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
    stage.style.setProperty("--stage-steps", String(count));
    if (index) index.hidden = false;

    let current = -1;
    let queued = false;

    const stepLength = () => track.offsetHeight / count;
    const stageTop = () => stage.getBoundingClientRect().top + window.scrollY;

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
        const offset = window.scrollY - stageTop();
        const progress = Math.min(1, Math.max(0, offset / (track.offsetHeight - stepLength())));
        stage.style.setProperty("--stage-progress", progress.toFixed(4));
        const step = Math.min(count - 1, Math.max(0, Math.floor(offset / stepLength() + 0.15)));
        show(step);
    }

    function goTo(step, smooth) {
        const top = stageTop() + step * stepLength() + 2;
        window.scrollTo({ top, behavior: smooth && !reduce.matches ? "smooth" : "auto" });
    }

    window.addEventListener("scroll", () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(measure);
    }, { passive: true });

    window.addEventListener("resize", measure);

    // The index and the two halves of the tagline both jump to their statement.
    jumps.forEach((item) => {
        item.addEventListener("click", () => goTo(Number(item.dataset.goto), true));
    });

    // Arrow keys step through the statements while the stage is on screen.
    document.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target;
        if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        const box = stage.getBoundingClientRect();
        if (box.top > 1 || box.bottom < window.innerHeight) return;
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
