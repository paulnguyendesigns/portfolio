async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const currentScrollY = window.scrollY;

        // Ignore tiny jitters (e.g. mobile bounce scroll)
        if (Math.abs(currentScrollY - lastScrollY) < 5) {
            ticking = false;
            return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            // Scrolling down and past the header — hide it
            header.classList.add("header-hidden");
        } else {
            // Scrolling up — show it
            header.classList.remove("header-hidden");
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });
}

async function init() {
    // Load components
    await loadComponent("header", "./header-footer/header.html");
    await loadComponent("footer", "./header-footer/footer.html");

    // Set up hide/show-on-scroll behavior now that the header exists
    initHeaderScroll();

    // Set up the hamburger menu now that the header exists in the DOM
    initHamMenu();

    // Create observer after footer exists
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.30
    });

    // Find all hidden elements
    const hiddenElements = document.querySelectorAll(".hidden");

    hiddenElements.forEach((el) => observer.observe(el));
}

init();