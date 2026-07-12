async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

loadComponent("header", "./header-footer/header.html");
loadComponent("footer", "./header-footer/footer.html");