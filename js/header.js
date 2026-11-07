const listaItems = document.querySelector('.navbar-nav');

if (estaLogueado()) {
    listaItems.innerHTML += `
        <li>
            <a href="panelAdmin.html" class="nav-link text-white">Panel</a>
        </li>

        <li>
            <button class="btn btn-secondary" onclick="cerrarSesion()">Cerrar Sesión</button>
        </li>
    `;

    document.getElementById('link-login')?.remove()
}