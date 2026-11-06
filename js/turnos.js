document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioTurno");
    const selectMascota = document.getElementById("selectMascota");
    const selectVeterinario = document.getElementById("selectVeterinario");
    const tabla = document.getElementById("tablaTurnos");
    const totalBadge = document.getElementById("totalTurnos");

    // Elementos de filtros
    const filtroVeterinario = document.getElementById("filtroVeterinario");
    const filtroFecha = document.getElementById("filtroFecha");
    const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

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

        // Selector del formulario
        selectMascota.innerHTML = '<option value="" selected disabled>Seleccionar Mascota...</option>';
        mascotas.forEach(m => {
            selectMascota.innerHTML += `<option value="${m.idMascota}">${m.nombreMascota} (${m.nombreDuenio})</option>`;
        });

        selectVeterinario.innerHTML = '<option value="" selected disabled>Seleccionar Veterinario...</option>';
        veterinarios.forEach(v => {
            selectVeterinario.innerHTML += `<option value="${v.idVeterinario}">${v.nombre} - ${v.especializacion}</option>`;
        });

        // Selector del filtro
        filtroVeterinario.innerHTML = '<option value="">Todos los veterinarios</option>';
        veterinarios.forEach(v => {
            filtroVeterinario.innerHTML += `<option value="${v.idVeterinario}">${v.nombre}</option>`;
        });
    }

    // REGISTRAR TURNO
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevoTurno = {
            idTurno: crypto.randomUUID(), //Codigo random para identificar el turno dado al paciente
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

    // FILTRADO
    filtroVeterinario.addEventListener("change", renderizarTabla);
    filtroFecha.addEventListener("change", renderizarTabla);

    btnLimpiarFiltros.addEventListener("click", () => {
        filtroVeterinario.value = "";
        filtroFecha.value = "";
        renderizarTabla();
    });

    // LISTAR Y FILTRAR TURNOS
    function renderizarTabla() {
        let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

        // Aplicar filtro por veterinario
        const vetId = filtroVeterinario.value;
        if (vetId) {
            turnos = turnos.filter(t => t.veterinario === vetId);
        }

        // Aplicar filtro por fecha (YYYY-MM-DD)
        const fechaFiltro = filtroFecha.value;
        if (fechaFiltro) {
            turnos = turnos.filter(t => t.fechaHora.startsWith(fechaFiltro));
        }

        tabla.innerHTML = "";
        totalBadge.textContent = turnos.length;

        if (turnos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay turnos agendados con los criterios seleccionados.</td></tr>';
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
                <td class="fw-bold text-secondary">${precioFormateado}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="imprimirComprobante('${t.idTurno}')" title="Imprimir / PDF">
                        PDF
                        </button>
                        <button class="btn btn-outline-danger" onclick="abrirEliminarTurno('${t.idTurno}')" title="Cancelar turno">
                            Cancelar
                        </button>
                    </div>
                </td>
            `;
            tabla.appendChild(tr);
        });
    }

    // IMPRIMIR / GENERAR PDF
    window.imprimirComprobante = (id) => {
        const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
        const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];
        const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

        const turno = turnos.find(t => t.idTurno === id);
        if (!turno) return;

        const m = mascotas.find(item => item.idMascota === turno.mascota) || { nombreMascota: "Desconocida", nombreDuenio: "-" };
        const v = veterinarios.find(item => item.idVeterinario === turno.veterinario) || { nombre: "Sin asignar", especializacion: "-", valorConsulta: 0 };

        const fechaFormateada = new Date(turno.fechaHora).toLocaleString('es-AR', {
            dateStyle: 'full',
            timeStyle: 'short'
        });

        const precioFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(v.valorConsulta || 0);

        const ventanaImpresion = window.open("", "_blank", "width=650,height=700");
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Comprobante de Turno - Veterinaria La Mary</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
                    .header { text-align: center; border-bottom: 2px solid #2f0f70; padding-bottom: 15px; margin-bottom: 25px; }
                    .header h1 { color: #2f0f70; margin: 0; font-size: 24px; }
                    .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
                    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #fdfdfd; margin-bottom: 25px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 8px; }
                    .label { font-weight: bold; color: #555; }
                    .value { font-weight: bold; color: #000; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Clínica Veterinaria La Mary</h1>
                    <p>Gdor. Gral. Balcarce 327, Concordia, Entre Ríos</p>
                    <p><strong>Comprobante de Turno Agendado</strong></p>
                </div>

                <div class="card">
                    <div class="row"><span class="label">Código de Turno:</span> <span class="value">${turno.idTurno.slice(0, 8).toUpperCase()}</span></div>
                    <div class="row"><span class="label">Fecha y Hora:</span> <span class="value">${fechaFormateada}</span></div>
                    <div class="row"><span class="label">Mascota:</span> <span class="value">${m.nombreMascota}</span></div>
                    <div class="row"><span class="label">Dueño / Responsable:</span> <span class="value">${m.nombreDuenio}</span></div>
                    <div class="row"><span class="label">Veterinario Asignado:</span> <span class="value">${v.nombre} (${v.especializacion || 'General'})</span></div>
                    <div class="row"><span class="label">Costo Estimado de Consulta:</span> <span class="value">${precioFormateado}</span></div>
                </div>

                <div class="footer">
                    <p>Por favor, concurrir 10 minutos antes del horario pactado.</p>
                    <p>¡Gracias por confiar en Veterinaria La Mary!</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
    };

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