if (!estaLogueado()) {
    window.location.href = 'login.html'
}


document.addEventListener("DOMContentLoaded", () => {
  // Referencias al DOM
  const formulario = document.getElementById("formularioVeterinario");
  const tabla = document.getElementById("tablaVeterinarios");
  const totalBadge = document.getElementById("totalVeterinarios");
  const buscador = document.getElementById("buscadorVeterinarios");

  // Modal Editar
  const modalEditarEl = document.getElementById("modalEditarVeterinario");
  const modalEditar = new bootstrap.Modal(modalEditarEl);
  const formularioEditar = document.getElementById("formularioEditarVeterinario");

  // Modal Eliminar
  const modalEliminarEl = document.getElementById("modalEliminarVeterinario");
  const modalEliminar = new bootstrap.Modal(modalEliminarEl);
  const confirmarEliminarBtn = document.getElementById("confirmarEliminarBtn");

  let idVeterinarioAEliminar = null;

  // Carga inicial
  renderizarTabla();

  // 1. REGISTRAR VETERINARIO
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoVeterinario = {
      idVeterinario: crypto.randomUUID(),
      // ID autogenerado
      matricula: parseInt(document.getElementById("matricula").value),
      nombre: document.getElementById("nombre").value.trim(),
      especializacion: document.getElementById("especializacion").value,
      valorConsulta: parseFloat(document.getElementById("valorConsulta").value)
    };

    const lista = obtenerVeterinarios();
    lista.push(nuevoVeterinario);
    guardarEnLocalStorage(lista);

    formulario.reset();
    renderizarTabla();
  });

  // 2. LISTAR Y FILTRAR
  function renderizarTabla(filtro = "") {
    const lista = obtenerVeterinarios();
    tabla.innerHTML = "";

    const listaFiltrada = lista.filter(v =>
      v.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      v.matricula.toString().includes(filtro) ||
      v.especializacion.toLowerCase().includes(filtro.toLowerCase())
    );

    totalBadge.textContent = listaFiltrada.length;

    if (listaFiltrada.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3">
            No hay veterinarios registrados.
          </td>
        </tr>`;
      return;
    }

    listaFiltrada.forEach(v => {
      // Formatear valor de la consulta en Pesos Argentinos
      const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
      }).format(v.valorConsulta);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><strong>${v.matricula}</strong></td>
        <td>${v.nombre}</td>
        <td><span class="badge bg-secondary">${v.especializacion}</span></td>
        <td class="fw-bold text-light-emphasis">${precioFormateado}</td>
        <td class="text-center">
          <button class="btn btn-warning btn-sm me-1" onclick="abrirEditar('${v.idVeterinario}')">
            Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="abrirEliminar('${v.idVeterinario}')">
            Eliminar
          </button>
        </td>
      `;

      tabla.appendChild(tr);
    });
  }

  // Buscador en tiempo real
  buscador.addEventListener("input", (e) => {
    renderizarTabla(e.target.value.trim());
  });

  // 3. EDITAR
  window.abrirEditar = (id) => {
    const lista = obtenerVeterinarios();
    const v = lista.find(item => item.idVeterinario === id);

    if (!v) return;

    document.getElementById("editarIdVeterinario").value = v.idVeterinario;
    document.getElementById("editarMatricula").value = v.matricula;
    document.getElementById("editarNombre").value = v.nombre;
    document.getElementById("editarEspecializacion").value = v.especializacion;
    document.getElementById("editarValorConsulta").value = v.valorConsulta;

    modalEditar.show();
  };

  formularioEditar.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("editarIdVeterinario").value;
    const lista = obtenerVeterinarios();

    const index = lista.findIndex(item => item.idVeterinario === id);

    if (index !== -1) {
      lista[index].matricula = parseInt(document.getElementById("editarMatricula").value);
      lista[index].nombre = document.getElementById("editarNombre").value.trim();
      lista[index].especializacion = document.getElementById("editarEspecializacion").value;
      lista[index].valorConsulta = parseFloat(document.getElementById("editarValorConsulta").value);

      guardarEnLocalStorage(lista);
      modalEditar.hide();
      renderizarTabla(buscador.value.trim());
    }
  });

  // 4. ELIMINAR
  window.abrirEliminar = (id) => {
    idVeterinarioAEliminar = id;
    modalEliminar.show();
  };

  confirmarEliminarBtn.addEventListener("click", () => {
    if (!idVeterinarioAEliminar) return;

    let lista = obtenerVeterinarios();
    lista = lista.filter(item => item.idVeterinario !== idVeterinarioAEliminar);

    guardarEnLocalStorage(lista);
    modalEliminar.hide();
    idVeterinarioAEliminar = null;
    renderizarTabla(buscador.value.trim());
  });

  // FUNCIONES AUXILIARES LOCALSTORAGE
  function obtenerVeterinarios() {
    return JSON.parse(localStorage.getItem("veterinarios")) || [];
  }

  function guardarEnLocalStorage(lista) {
    localStorage.setItem("veterinarios", JSON.stringify(lista));
  }
});
