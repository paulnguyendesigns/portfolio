async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

// Builds the paper-tilt shell at runtime: moves everything currently in
// <body> into #paper-front (inside the scrollable #paper-window), then
// adds #paper-back (the real nav, revealed on tilt) and the hamburger/
// close buttons as body-level siblings so they never rotate with the page.
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

    const paperBack = document.createElement("div");
    paperBack.id = "paper-back";
    paperBack.innerHTML = `
        <nav aria-label="Mobile">
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="portfolio-all.html">Portfolio</a>
            <a href="updates.html">Updates</a>
            <a href="contact.html">Contact</a>
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

// Hide/show the sticky header based on scroll direction. Now reads
// #paper-window's scrollTop instead of window.scrollY, since
// #paper-window (not the document) is the actual scroll container.
function initHeaderScroll(scrollContainer) {
    const header = document.getElementById("header");
    if (!header || !scrollContainer) return;

    let lastScrollY = scrollContainer.scrollTop;
    let ticking = false;

    function onScroll() {
        const currentScrollY = scrollContainer.scrollTop;

        if (Math.abs(currentScrollY - lastScrollY) < 5) {
            ticking = false;
            return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            header.classList.add("header-hidden");
        } else {
            header.classList.remove("header-hidden");
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
}

// Switches to the mobile nav (hamburger) exactly when the desktop nav,
// logo, and actions would actually overlap — not at a guessed pixel
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
        // While open, clicking anywhere on the tilted front page closes the menu
        this.frontEl.addEventListener("click", this.closeBound);
    },

    close() {
        this.windowEl.classList.remove("tilt");
        this.hamburgerEl.setAttribute("aria-expanded", "false");
        this.frontEl.removeEventListener("click", this.closeBound);
    },

    updateTransformOrigin() {
        const scrollTop = this.windowEl.scrollTop;
        let equation = ((scrollTop + this.offset) / this.pageHeight) * 100;
        // Clamp so the pivot point never lands outside the actual page —
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

    const paperWindowEl = document.getElementById("paper-window");

    // Set up hide/show-on-scroll behavior now that the header exists
    initHeaderScroll(paperWindowEl);

    // Switch to the hamburger exactly when the desktop layout would collide
    initNavCollisionCheck();

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
