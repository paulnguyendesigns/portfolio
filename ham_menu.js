const hamburger = document.getElementById('hamburger');
const closeIcon = document.getElementById('close');
const offScreenMenu = document.querySelector('.left');

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
    if (window.innerWidth > 1050 && offScreenMenu.classList.contains('active')) {
        // Reset for larger screens
        hamburger.style.display = 'none';
        closeIcon.style.display = 'none';
    }
    else if (window.innerWidth > 1050 && !offScreenMenu.classList.contains('active')) {
        hamburger.style.display = 'none';
        closeIcon.style.display = 'none';
    }

    if (window.innerWidth < 1050 && !offScreenMenu.classList.contains('active')) {
        hamburger.style.display = 'block';
    }
    else if (window.innerWidth < 1050 && offScreenMenu.classList.contains('active')) {
        hamburger.style.display = 'block';
    }
});
