// Sets up the hamburger/close menu behavior.
// Must be called AFTER the header HTML has been injected into the page
// (e.g. from load.js, once loadComponent("header", ...) has finished).
function initHamMenu() {
    const hamburger = document.getElementById('hamburger');
    const closeIcon = document.getElementById('close');
    const offScreenMenu = document.querySelector('.left');

    if (!hamburger || !closeIcon || !offScreenMenu) {
        console.warn('initHamMenu: header elements not found in the DOM yet.');
        return;
    }

    // Function to open the menu
    function openMenu() {
        if (window.innerWidth <= 1050) {
            offScreenMenu.classList.add('active');
            hamburger.style.display = 'none'; // Hide hamburger
            closeIcon.style.display = 'block'; // Show close icon
        }
    }

    // Function to close the menu
    function closeMenu() {
        if (window.innerWidth <= 1050) {
            offScreenMenu.classList.remove('active');
            closeIcon.style.display = 'none'; // Hide close icon
            hamburger.style.display = 'block'; // Show hamburger icon
        }
    }

    // Add event listeners for the icons
    hamburger.addEventListener('click', openMenu);
    closeIcon.addEventListener('click', closeMenu);

    // Reset menu state when the window is resized
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1050) {
            // Desktop: neither icon shows, and reset the menu so it
            // doesn't reopen already-active if the user resizes back down
            offScreenMenu.classList.remove('active');
            hamburger.style.display = 'none';
            closeIcon.style.display = 'none';
        } else {
            // Mobile: show exactly one icon, matching the menu's current state
            if (offScreenMenu.classList.contains('active')) {
                hamburger.style.display = 'none';
                closeIcon.style.display = 'block';
            } else {
                hamburger.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        }
    });
}
