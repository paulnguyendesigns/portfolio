async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

async function init() {
    // Load components
    loadComponent("header", "./header-footer/header.html");
    await loadComponent("footer", "./header-footer/footer.html");

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