document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorVeterinarios");

  // obtiene los veterinarios guardados en el LocalStorage
  const listaVeterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

  // si no hay veterinarios registrados,muestra un mensaje
  if (listaVeterinarios.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">No hay veterinarios registrados actualmente.</p>
      </div>
    `;
    return;
  }

  // recorre y crear las tarjetas
  listaVeterinarios.forEach(v => {
    const precioFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(v.valorConsulta);

    const col = document.createElement("div");
    col.classList.add("col");

    col.innerHTML = `
      <div class="card shadow h-100">
          <img src="./assets/imagen/profesional_index.jpg" class="rounded-circle img-fluid shadow-sm" style="width: 150px; height: 150px; object-fit: cover;" alt="${v.nombre}" >
          <div class="card-body d-flex flex-column justify-content-between">
              <div>
                  <h5 class="card-title titulo-principal fw-bolder">${v.nombre}</h5>
                  <p class="card-text text-muted small mb-1">Matrícula: ${v.matricula}</p>
                  <p class="card-text titulo-principal "><strong>Especialidad:</strong> ${v.especializacion}</p>
              </div>
              <p class="fw-bold text-light-emphasis mt-2 mb-0">Consulta: ${precioFormateado}</p>
              <div class="d-flex justify-content-center justify-content-sm-start">
                <a class="btn boton-logo px-4 py-2 rounded-3" href="./contactos.html">
                    <span class="texto-blanco fw-bold">Pedir Turno</span>
                </a>
              </div>
          </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
});