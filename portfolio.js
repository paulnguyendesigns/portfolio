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
        software: "Github Pages",
        softwareIcon: "ri-ghost-line",
        status: "IN DEVELOPMENT",
        description: "A website that turns audio input into watercolor graphics.",
        tags: ["Javascript", "CSS", "HTML", "Github Pages"],
        still: "./images-gifs/webgl_simulator.png",
        gif: "./images-gifs/webgl_simulator.gif",
        link: "https://paulnguyendesigns.github.io/WebGL-Fluid-Sound-Simulator/"
    },
    {
        title: "Hue Day",
        category: "software",
        software: "React",
        softwareIcon: "ri-gamepad-line",
        status: null,
        description: "An interactive website that finds your seasonal color profile and shows your best colors.",
        tags: ["Python", "Javascript", "CSS", "HTML", "React", "Flask"],
        still: "./images-gifs/hue-day.png",
        gif: "./images-gifs/hue-day.gif",
        link: "https://devpost.com/software/hue-day"
    },
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