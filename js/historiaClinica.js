document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioHistoria");
    const selectMascota = document.getElementById("selectMascotaHC");
    const selectVeterinario = document.getElementById("selectVeterinarioHC");
    const filtroMascota = document.getElementById("filtroMascotaHC");
    const tabla = document.getElementById("tablaHistoriaClinica");

    cargarDesplegables();
    renderizarTabla();

    function cargarDesplegables() {
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

        selectMascota.innerHTML = '<option value="" selected disabled>Seleccionar Mascota...</option>';
        filtroMascota.innerHTML = '<option value="TODAS">Todas las Mascotas</option>';

        mascotas.forEach(m => {
            selectMascota.innerHTML += `<option value="${m.idMascota}">${m.nombreMascota} (${m.nombreDuenio})</option>`;
            filtroMascota.innerHTML += `<option value="${m.idMascota}">${m.nombreMascota} (${m.nombreDuenio})</option>`;
        });

        selectVeterinario.innerHTML = '<option value="" selected disabled>Seleccionar Veterinario...</option>';
        veterinarios.forEach(v => {
            selectVeterinario.innerHTML += `<option value="${v.idVeterinario}">${v.nombre} - ${v.especializacion}</option>`;
        });
    }

    // REGISTRAR HISTORIA CLÍNICA
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevaHistoria = {
            idHistoriaClinica: crypto.randomUUID(),
            mascota: selectMascota.value,
            veterinario: selectVeterinario.value,
            fechaHora: document.getElementById("fechaHoraHC").value,
            observaciones: document.getElementById("observacionesHC").value.trim()
        };

        const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
        historias.push(nuevaHistoria);
        localStorage.setItem("historiasClinicas", JSON.stringify(historias));

        formulario.reset();
        renderizarTabla();
    });

    // LISTAR E HISTORIAL POR MASCOTA
    function renderizarTabla() {
        const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
        const idFiltro = filtroMascota.value;

        tabla.innerHTML = "";

        const historiasFiltradas = (idFiltro === "TODAS")
            ? historias
            : historias.filter(h => h.mascota === idFiltro);

        if (historiasFiltradas.length === 0) {
            tabla.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay registros médicos cargados para mostrar.</td></tr>';
            return;
        }

        historiasFiltradas.forEach(h => {
            const m = mascotas.find(item => item.idMascota === h.mascota) || { nombreMascota: "Desconocida", nombreDuenio: "-" };
            const v = veterinarios.find(item => item.idVeterinario === h.veterinario) || { nombre: "Sin asignar" };

            const fechaFormateada = new Date(h.fechaHora).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${fechaFormateada}</strong></td>
                <td><span class="badge bg-info text-dark">${m.nombreMascota}</span> <small class="text-muted">(${m.nombreDuenio})</small></td>
                <td>${v.nombre}</td>
                <td>${h.observaciones}</td>
            `;
            tabla.appendChild(tr);
        });
    }

    filtroMascota.addEventListener("change", renderizarTabla);
});