async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

// Take scroll position fully into our own hands. Left as "auto" (the
// default), the browser can restore whatever scroll position a previous
// visit to this page had -- or jump partway toward a #fragment on its
// own -- before our own code below ever runs, which is the other half of
// the "snaps somewhere, then glides to the right spot" effect.
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

// Builds the paper-tilt shell at runtime: moves everything currently in
// <body> into #paper-front (inside the scrollable #paper-window), then adds
// #paper-back (the real nav, revealed on tilt) and the hamburger/close
// buttons as body-level siblings -- NOT descendants of #paper-front.
//
// That placement is required, not cosmetic: paperMenu.open() adds a
// "click anywhere on the page closes the menu" listener to #paper-front
// during the same click event that opened it. If the hamburger lived
// inside #paper-front, that same click would keep bubbling upward, hit
// the listener that was *just* attached, and immediately close the menu
// it had just opened -- a single click would open and self-close in one
// tick. Keeping the hamburger/close outside that subtree avoids it.
function setupPaperShell() {
    const paperWindow = document.createElement("div");
    paperWindow.id = "paper-window";

    const paperFront = document.createElement("div");
    paperFront.id = "paper-front";

    while (document.body.firstChild) {
        paperFront.appendChild(document.body.firstChild);
    }

    paperWindow.appendChild(paperFront);
    document.body.appendChild(paperWindow);

    // Force the scroll position back to the very top. The browser's own
    // "jump to the #fragment" behavior (or bfcache scroll restoration) can
    // otherwise land #paper-window somewhere down the page before our own
    // script gets a chance to run its smooth, animated scroll -- producing
    // an instant snap partway down followed by a second, separate glide.
    // Doing this here, as early as possible, avoids that first snap.
    paperWindow.scrollTop = 0;

    const paperBack = document.createElement("div");
    paperBack.id = "paper-back";
    paperBack.innerHTML = `
        <nav aria-label="Mobile">
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="portfolio-all.html">Portfolio</a>
            <a href="updates.html">Updates</a>
            <a href="about.html#contact">Contact</a>
        </nav>`;
    document.body.appendChild(paperBack);

    const hamburger = document.createElement("button");
    hamburger.type = "button";
    hamburger.id = "hamburger";
    hamburger.className = "hamburger";
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-controls", "paper-back");
    hamburger.setAttribute("aria-label", "Open menu");
    hamburger.innerHTML = "<span></span>";
    document.body.appendChild(hamburger);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "close";
    closeBtn.className = "close";
    closeBtn.setAttribute("aria-label", "Close menu");
    document.body.appendChild(closeBtn);
}

// Hide/show the sticky header based on scroll direction, and keep the
// hamburger/close buttons in sync by toggling the same "chrome-hidden"
// class on them -- they can't just inherit the header's own transform
// since (per setupPaperShell's comment above) they deliberately live
// outside the header/#paper-front subtree.
//
// Returns { suspend, resume } so a programmatic scroll (like scrolling to
// a hash link) can pin the header visible for its duration -- otherwise
// the auto-hide logic below reacts to that same scroll animation and can
// hide the header mid-flight, which changes the effective header-height
// offset a hash scroll was aiming for and makes the landing spot look
// wrong until a second attempt (nothing left to fight over its state).
function initHeaderScroll(scrollContainer) {
    const header = document.getElementById("header");
    const hamburger = document.getElementById("hamburger");
    const closeBtn = document.getElementById("close");
    if (!header || !scrollContainer) return null;

    let lastScrollY = scrollContainer.scrollTop;
    let ticking = false;
    let suspended = false;

    function setHidden(hidden) {
        header.classList.toggle("header-hidden", hidden);
        if (hamburger) hamburger.classList.toggle("chrome-hidden", hidden);
        if (closeBtn) closeBtn.classList.toggle("chrome-hidden", hidden);
    }

    function onScroll() {
        const currentScrollY = scrollContainer.scrollTop;

        if (suspended) {
            // A hash-link scroll is in progress -- keep the header visible
            // and stable so the offset it was scrolled to doesn't shift
            // out from under it.
            setHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        if (Math.abs(currentScrollY - lastScrollY) < 5) {
            ticking = false;
            return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    scrollContainer.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    return {
        suspend() {
            suspended = true;
            setHidden(false);
        },
        resume() {
            suspended = false;
            lastScrollY = scrollContainer.scrollTop;
        }
    };
}

// Switches to the mobile nav (hamburger) exactly when the desktop nav,
// logo, and actions would actually overlap -- not at a guessed pixel
// breakpoint. Since the logo/nav/actions all use fixed (non-scaling)
// sizes, the width where they collide depends on their real measured
// widths, which this checks directly.
function initNavCollisionCheck() {
    const headerInner = document.querySelector(".header-inner");
    const navStart = document.querySelector(".nav-start");
    const brand = document.querySelector(".brand");
    const headerActions = document.querySelector(".header-actions");

    if (!headerInner || !navStart || !brand || !headerActions) return;

    const buffer = 40; // breathing room so items don't just barely touch

    function check() {
        // Measure against the desktop layout's natural widths, regardless
        // of which layout is currently showing (mobile hides nav-start's
        // content, which would otherwise report 0 width).
        document.body.classList.remove("nav-mobile");

        const required = navStart.scrollWidth + brand.scrollWidth + headerActions.scrollWidth + buffer * 2;
        const available = headerInner.clientWidth;

        if (required > available) {
            document.body.classList.add("nav-mobile");
        }
    }

    check();

    let ticking = false;
    window.addEventListener("resize", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                check();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Smoothly scrolls to same-page hash links (e.g. "Contact" -> "#contact").
// Needed because the page scrolls inside #paper-window, not the real
// `window` -- a plain `href="#contact"` jump does nothing on its own here,
// and a browser's native cross-page hash-jump (arriving from another page
// with "about.html#contact" in the URL) would also just snap instantly,
// before #paper-window even exists yet.
function initSmoothAnchors(scrollContainer, headerScrollControls) {
    function targetOffsetTop(target) {
        const header = document.getElementById("header");
        const headerHeight = header ? header.offsetHeight : 0;

        const offset = 100;

        return Math.max(target.offsetTop - headerHeight + offset, 0);
    }

    function scrollToHash(hash, smooth) {
        const target = document.getElementById(hash.replace("#", ""));
        if (!target) return;

        // Pin the header visible for the whole trip -- see the comment on
        // initHeaderScroll's return value for why this matters.
        if (headerScrollControls) headerScrollControls.suspend();

        // Wait a frame so anything else from this same click (e.g. the
        // mobile menu's close-on-link-click, which runs its own listener
        // first -- see paperMenu.bindEvents) has finished before we
        // measure, rather than measuring mid-toggle.
        requestAnimationFrame(() => {
            scrollContainer.scrollTo({
                top: targetOffsetTop(target),
                behavior: smooth ? "smooth" : "auto"
            });

            if (!headerScrollControls) return;

            const resume = () => headerScrollControls.resume();

            if ("onscrollend" in scrollContainer) {
                scrollContainer.addEventListener("scrollend", resume, { once: true });
            } else {
                // Fallback for browsers without scrollend support -- long
                // enough to cover a smooth scroll across a full page.
                setTimeout(resume, 800);
            }
        });
    }

    // Intercept clicks on links that point at a hash on *this* page (same
    // pathname) and scroll instead of doing a full page reload. Links to a
    // hash on a *different* page (e.g. clicking "Contact" from index.html)
    // are left alone -- the browser navigates normally, and that page's own
    // load.js will pick up the hash once it finishes loading.
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href*='#']");
        if (!link) return;

        let url;
        try {
            url = new URL(link.getAttribute("href"), window.location.href);
        } catch {
            return;
        }

        const samePage = url.pathname === window.location.pathname;
        if (!samePage || !url.hash) return;

        event.preventDefault();
        scrollToHash(url.hash, true);
        history.pushState(null, "", url.hash);
    });

    // Arrived here fresh with a hash already in the URL (e.g. followed
    // "about.html#contact" from another page). Two things can still shift
    // layout after the browser's own `load` event fires, both of which
    // would make a position measured right at `load` stale:
    //
    //   1. Web fonts: `load` does not wait for @font-face swaps. Headings
    //      here render in a fallback system font first, then swap to
    //      'M PLUS Rounded 1c' (a different size) once it arrives -- which
    //      changes the height of everything above #contact and pushes it
    //      further down than where we already scrolled.
    //   2. If `load` already fired before we got here (e.g. this listener
    //      is registered after our own async header/footer fetches, which
    //      can finish after a fast/cached `load`), a plain
    //      `addEventListener("load", ...)` would never fire at all.
    //
    // document.readyState/fonts.ready cover both.
    if (window.location.hash) {
        const pageLoaded = new Promise((resolve) => {
            if (document.readyState === "complete") {
                resolve();
            } else {
                window.addEventListener("load", resolve, { once: true });
            }
        });

        const fontsReady = document.fonts && document.fonts.ready
            ? document.fonts.ready
            : Promise.resolve();

        Promise.all([pageLoaded, fontsReady]).then(() => {
            // Guarantee a clean starting point: instantly at the top,
            // then one smooth glide down to the target -- rather than
            // whatever position a native fragment-jump or scroll
            // restoration left us at.
            scrollContainer.scrollTo({ top: 0, behavior: "auto" });

            // One more frame so the fonts.ready-triggered reflow has
            // actually been painted before we measure.
            requestAnimationFrame(() => scrollToHash(window.location.hash, true));
        });
    }
}

// The paper-tilt menu. Tilting #paper-front reveals #paper-back
// underneath it; the transform-origin is kept in sync with scroll
// position so the page always tilts around a sensible pivot point.
const paperMenu = {
    // Fraction of page height added to scroll position before converting
    // to a transform-origin percentage. 0.7 matches a natural resting
    // pivot point near the bottom third of the visible viewport.
    offsetRatio: 0.7,

    init() {
        this.windowEl = document.getElementById("paper-window");
        this.frontEl = document.getElementById("paper-front");
        this.hamburgerEl = document.getElementById("hamburger");
        this.closeEl = document.getElementById("close");

        if (!this.windowEl || !this.frontEl || !this.hamburgerEl) return;

        this.pageHeight = this.frontEl.offsetHeight;
        this.offset = this.pageHeight * this.offsetRatio;
        this.openBound = this.open.bind(this);
        this.closeBound = this.close.bind(this);
        this.updateOriginBound = this.updateTransformOrigin.bind(this);

        this.bindEvents();
        this.updateTransformOrigin();
    },

    open() {
        this.windowEl.classList.add("tilt");
        this.hamburgerEl.setAttribute("aria-expanded", "true");
        // While open, clicking anywhere on the tilted front page closes the
        // menu. Deferred one tick so the click that just opened the menu
        // (which is still bubbling at this point) doesn't immediately
        // trigger this same listener and self-close it.
        requestAnimationFrame(() => {
            this.frontEl.addEventListener("click", this.closeBound);
        });
    },

    close() {
        this.windowEl.classList.remove("tilt");
        this.hamburgerEl.setAttribute("aria-expanded", "false");
        this.frontEl.removeEventListener("click", this.closeBound);
    },

    updateTransformOrigin() {
        const scrollTop = this.windowEl.scrollTop;
        let equation = ((scrollTop + this.offset) / this.pageHeight) * 100;
        // Clamp so the pivot point never lands outside the actual page --
        // without this, short pages cause the tilt to swing wildly out
        // of view instead of a controlled, visible reveal.
        equation = Math.min(Math.max(equation, 0), 100);
        this.frontEl.style.transformOrigin = `center ${equation}%`;
    },

    bindEvents() {
        this.hamburgerEl.addEventListener("click", this.openBound);
        if (this.closeEl) this.closeEl.addEventListener("click", this.closeBound);

        this.windowEl.addEventListener("scroll", this.updateOriginBound, { passive: true });

        // Close on Escape for keyboard users
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.windowEl.classList.contains("tilt")) {
                this.close();
            }
        });

        // Recalculate pivot math if content height changes (e.g. window resize)
        window.addEventListener("resize", () => {
            this.pageHeight = this.frontEl.offsetHeight;
            this.offset = this.pageHeight * this.offsetRatio;
            this.updateTransformOrigin();
        });

        // Close automatically when a mobile nav link is followed
        document.querySelectorAll("#paper-back nav a").forEach((link) => {
            link.addEventListener("click", () => this.close());
        });
    },
};

async function init() {
    // Build the paper-tilt shell first so #header/#footer placeholders
    // end up inside #paper-front once we load components into them.
    setupPaperShell();

    // Load components
    await loadComponent("header", "./header-footer/header.html");
    await loadComponent("footer", "./header-footer/footer.html");

    // header.html is just the inner markup (no wrapping <header> tag) --
    // the "site-header" class that drives its background/sticky/hide
    // styling belongs on the placeholder itself, applied here once.
    document.getElementById("header").classList.add("site-header");

    const paperWindowEl = document.getElementById("paper-window");

    // Set up hide/show-on-scroll behavior now that the header exists
    const headerScrollControls = initHeaderScroll(paperWindowEl);

    // Switch to the hamburger exactly when the desktop layout would collide
    initNavCollisionCheck();

    // Smoothly scroll to same-page hash links (e.g. the Contact nav link
    // now pointing at about.html#contact)
    initSmoothAnchors(paperWindowEl, headerScrollControls);

    // Set up the paper-tilt mobile menu
    paperMenu.init();

    // Create observer after footer exists. Root must be #paper-window
    // now, since that's the actual scrolling container (not the viewport).
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        root: paperWindowEl,
        threshold: 0.30
    });

    // Find all hidden elements
    const hiddenElements = document.querySelectorAll(".hidden");

    hiddenElements.forEach((el) => observer.observe(el));
}

init();
