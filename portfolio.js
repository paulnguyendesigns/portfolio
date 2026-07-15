// portfolio.js
// Single file containing both the project data and the rendering logic
// used by portfolio-all.html, portfolio-software.html, and portfolio-games.html.
//
// Each page just includes this file and then calls:
//     renderPortfolio();            // no filter -> show everything (All page)
//     renderPortfolio("games");     // only category: "games"
//     renderPortfolio("software");  // only category: "software"

const projects = [
    {
        title: "WebGL Fluid Sound Simulator",
        category: "software",
        software: "Javascript",
        softwareIcon: "ri-ghost-line",
        status: "IN DEVELOPMENT",
        description: "A website that turns audio input into watercolor graphics.",
        tags: ["Javascript", "CSS", "HTML", "Github Pages"],
        still: "./images-gifs/webgl_simulator.png",
        gif: "./images-gifs/webgl_simulator.gif",
        link: "#"
    },
    {
        title: "Oliver the Octopus",
        category: "games",
        software: "Unity",
        softwareIcon: "ri-gamepad-line",
        status: null,
        description: "A platform game based on crates with different mechanics.",
        tags: ["Adventure", "Platformer", "2.5D", "Co-op", "Family"],
        still: "assets/oliver_octopus.png",
        gif: "assets/oliver_octopus.gif",
        link: "#"
    },
    {
        title: "Tinturaria",
        category: "games",
        software: "Unity",
        softwareIcon: "ri-gamepad-line",
        status: null,
        description: "A game about delivering as many colored boxes with the right color as possible.",
        tags: ["Puzzle", "Casual", "Time Management", "Color Matching", "Arcade"],
        still: "assets/tinturaria.png",
        gif: "assets/tinturaria.gif",
        link: "#"
    }
];

const COLUMNS = 3; // matches the grid-template-columns in css/portfolio.css

function cardTemplate(p, index) {
    const row = Math.floor(index / COLUMNS);

    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join("");

    const statusHtml = p.status
        ? `<span class="status-badge">${p.status}</span>`
        : `<span></span>`;

    return `
        <a class="project-card" style="--row:${row}" href="${p.link}">
            <div class="thumb-wrap">
                <img class="thumb-still" src="${p.still}" alt="${p.title} screenshot" loading="lazy">
                <img class="thumb-gif" src="${p.gif}" alt="${p.title} gameplay preview" loading="lazy">
                <div class="badge-row">
                    <span class="software-badge"><i class="${p.softwareIcon}"></i>${p.software}</span>
                    ${statusHtml}
                </div>
            </div>
            <div class="card-body">
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <div class="tag-row">${tagsHtml}</div>
            </div>
        </a>
    `;
}

function renderPortfolio(category) {
    const list = category ? projects.filter(p => p.category === category) : projects;

    document.getElementById("project-grid").innerHTML =
        list.map((p, i) => cardTemplate(p, i)).join("");

    // Reveal the whole wrapper once it scrolls into view. Each card's own
    // transition-delay (based on its --row value, set inline above) makes
    // row 0 appear first, then row 1, then row 2, etc.
    const revealWrapper = document.getElementById("reveal-wrapper");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealObserver.observe(revealWrapper);
}