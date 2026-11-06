(function () {
    // Páginas que requieren inicio de sesión obligatorio
    const paginasPrivadas = ["mascotas.html", "veterinarios.html", "turnos.html", "historiaclinica.html"];

    // Obtener la página actual desde la URL
    const pathActual = window.location.pathname.toLowerCase();
    const paginaActual = pathActual.split("/").pop() || "index.html";

    // Verificar si existe sesión en sessionStorage
    const sesion = JSON.parse(sessionStorage.getItem("userSession"));
    const estaAutenticado = Boolean(sesion && sesion.token);

    // 1. PROTECCIÓN DE RUTAS PRIVADAS
    const esPrivada = paginasPrivadas.some(p => paginaActual.includes(p));
    if (esPrivada && !estaAutenticado) {
        window.location.href = "./login.html";
        return;
    }

    // 2. CONSTRUCCIÓN Y CONTROL DEL MENÚ DE NAVEGACIÓN
    document.addEventListener("DOMContentLoaded", () => {
        const navContainer = document.getElementById("menuNavegacion");
        if (!navContainer) return;

        let ulNav = navContainer.querySelector("ul");
        if (!ulNav) {
            ulNav = document.createElement("ul");
            ulNav.className = "navbar-nav gap-2 gap-lg-3 text-center mt-3 mt-lg-0";
            ulNav.id = "navLinks";
            navContainer.appendChild(ulNav);
        }

        // Definir ítems del menú según estado de autenticación
        let htmlMenu = `
            <li class="nav-item">
                <a href="./index.html" class="nav-link text-white ${paginaActual.includes("index") ? "active" : ""}">Inicio</a>
            </li>
            <li class="nav-item">
                <a href="./institucional.html" class="nav-link text-white ${paginaActual.includes("institucional") ? "active" : ""}">Institucional</a>
            </li>
            <li class="nav-item">
                <a href="./contactos.html" class="nav-link text-white ${paginaActual.includes("contactos") ? "active" : ""}">Contacto</a>
            </li>
        `;

        if (estaAutenticado) {
            // Menu para administradores con Sesión Activa
            htmlMenu += `
                <li class="nav-item">
                    <a href="./mascotas.html" class="nav-link text-white ${paginaActual.includes("mascotas") ? "active" : ""}">Mascotas</a>
                </li>
                <li class="nav-item">
                    <a href="./veterinarios.html" class="nav-link text-white ${paginaActual.includes("veterinarios") ? "active" : ""}">Veterinarios</a>
                </li>
                <li class="nav-item">
                    <a href="./turnos.html" class="nav-link text-white ${paginaActual.includes("turnos") ? "active" : ""}">Turnos</a>
                </li>
                <li class="nav-item">
                    <a href="./historiaClinica.html" class="nav-link text-white ${paginaActual.includes("historiaclinica") ? "active" : ""}">Historia Clínica</a>
                </li>
                <li class="nav-item ms-lg-2">
                    <button id="btnCerrarSesion" class="btn btn-outline-light btn-sm px-3 py-1 fw-bold rounded-3 mt-2 mt-lg-0">
                        Cerrar Sesión (${sesion.username || 'Admin'})
                    </button>
                </li>
            `;
        } else {
            // menu para visitantes anónimos
            htmlMenu += `
                <li class="nav-item ms-lg-2">
                    <a href="./login.html" class="btn btn-light text-primary btn-sm px-3 py-1 fw-bold rounded-3 mt-2 mt-lg-0">
                        Iniciar Sesión
                    </a>
                </li>
            `;
        }

        ulNav.innerHTML = htmlMenu;

        // configurar botón de Logout
        const btnCerrarSesion = document.getElementById("btnCerrarSesion");
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", () => {
                sessionStorage.removeItem("userSession");
                window.location.href = "./index.html";
            });
        }
    });
})();