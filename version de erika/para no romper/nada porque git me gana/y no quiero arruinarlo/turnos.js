document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioTurno");
    const selectMascota = document.getElementById("selectMascota");
    const selectVeterinario = document.getElementById("selectVeterinario");
    const tabla = document.getElementById("tablaTurnos");
    const totalBadge = document.getElementById("totalTurnos");

    const modalEliminarEl = document.getElementById("modalEliminarTurno");
    const modalEliminar = new bootstrap.Modal(modalEliminarEl);
    const confirmarEliminarBtn = document.getElementById("confirmarEliminarTurnoBtn");

    let idTurnoAEliminar = null;

    // Cargar selectores y tabla
    cargarDesplegables();
    renderizarTabla();

    function cargarDesplegables() {
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

        selectMascota.innerHTML = '<option value="" selected disabled>Seleccionar Mascota...</option>';
        mascotas.forEach(m => {
            selectMascota.innerHTML += `<option value="${m.idMascota}">${m.nombreMascota} (${m.nombreDuenio})</option>`;
        });

        selectVeterinario.innerHTML = '<option value="" selected disabled>Seleccionar Veterinario...</option>';
        veterinarios.forEach(v => {
            selectVeterinario.innerHTML += `<option value="${v.idVeterinario}">${v.nombre} - ${v.especializacion}</option>`;
        });
    }

    // REGISTRAR TURNO
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevoTurno = {
            idTurno: crypto.randomUUID(),
            mascota: selectMascota.value,
            veterinario: selectVeterinario.value,
            fechaHora: document.getElementById("fechaHora").value
        };

        const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
        turnos.push(nuevoTurno);
        localStorage.setItem("turnos", JSON.stringify(turnos));

        formulario.reset();
        renderizarTabla();
    });

    // LISTAR TURNOS
    function renderizarTabla() {
        const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

        tabla.innerHTML = "";
        totalBadge.textContent = turnos.length;

        if (turnos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay turnos agendados.</td></tr>';
            return;
        }

        turnos.forEach(t => {
            const m = mascotas.find(item => item.idMascota === t.mascota) || { nombreMascota: "Desconocida", nombreDuenio: "-" };
            const v = veterinarios.find(item => item.idVeterinario === t.veterinario) || { nombre: "Sin asignar", valorConsulta: 0 };

            const fechaFormateada = new Date(t.fechaHora).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });

            const precioFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
            }).format(v.valorConsulta || 0);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${fechaFormateada}</strong></td>
                <td>${m.nombreMascota} <small class="text-muted">(${m.nombreDuenio})</small></td>
                <td>${v.nombre}</td>
                <td class="fw-bold text-success">${precioFormateado}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="abrirEliminarTurno('${t.idTurno}')">
                        Cancelar
                    </button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    }

    // ELIMINAR TURNO
    window.abrirEliminarTurno = (id) => {
        idTurnoAEliminar = id;
        modalEliminar.show();
    };

    confirmarEliminarBtn.addEventListener("click", () => {
        if (!idTurnoAEliminar) return;

        let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
        turnos = turnos.filter(t => t.idTurno !== idTurnoAEliminar);
        localStorage.setItem("turnos", JSON.stringify(turnos));

        modalEliminar.hide();
        idTurnoAEliminar = null;
        renderizarTabla();
    });
});