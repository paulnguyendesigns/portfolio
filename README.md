# Paul Nguyen — Portfolio

A personal art and design portfolio website showcasing my work, spanning software projects, game development, and creative visuals.

## Features
- 🏠 Animated homepage with a typing-text intro and rotating info tagline
- 🖼️ Project showcase pages organized by category (software, games, all projects)
- 📄 About and Contact pages
- 📱 Responsive layout with mobile hamburger navigation
- ✨ Custom styling (polaroid-style photo, hover animations, flip-word effects)
- 🚀 Deployed via GitHub Pages

## Tech Stack
- **Languages:** HTML5, CSS3, JavaScript
- **Fonts/Icons:** Google Fonts (Dosis, Lexend, M PLUS Rounded 1c, Rubik), Remix Icon
- **Hosting/CI:** GitHub Pages, GitHub Actions (`.github/workflows`)
- **Structure:** Shared header/footer components loaded dynamically via JS, modular CSS per section

## Project Structure
```
├── index.html                  # Homepage
├── about.html                  # About Me page
├── contact.html                 # Contact page
├── portfolio-all.html           # All projects
├── portfolio-games.html         # Game dev projects
├── portfolio-software.html      # Software projects
├── updates.html                 # Site/project updates
├── portfolio.js                 # Portfolio page logic
├── ham_menu.js                  # Mobile nav menu
├── css/                         # Stylesheets
├── header-footer/               # Shared header/footer + loader script
└── images-gifs/                 # Site images and project thumbnails
```

## Setup
No build step required — it's a static site.
```bash
# Serve locally:
npx serve .
```
Or simply open `index.html` in a browser.

## Live Site
[paulnguyendesigns.github.io/portfolio](https://paulnguyendesigns.github.io/portfolio/)
