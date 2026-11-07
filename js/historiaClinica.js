if (!estaLogueado()) {
    window.location.href = 'login.html'
}
 
const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
 
const formulario = document.getElementById("formularioHistoria");
const selectMascota = document.getElementById("selectMascotaHC");
const selectVeterinario = document.getElementById("selectVeterinarioHC");
const inputFechaHora = document.getElementById("fechaHoraHC");
const tabla = document.getElementById("tablaHistoriaClinica");
const totalHistorias = document.getElementById("totalHistorias");
const buscadorHistoria = document.getElementById("buscadorHistoria");
const botonExportar = document.getElementById("botonExportarHC");
 
const modalMensaje = new bootstrap.Modal(document.getElementById("modalMensaje"));
const modalHistorial = new bootstrap.Modal(document.getElementById("modalHistorial"));
 
const mensajeGuardado = document.getElementById("mensajeGuardado");
const contenidoHistorial = document.getElementById("contenidoHistorial");
 
 
//Evita que el texto escrito por el usuario se interprete como HTML
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
 
 
//Formatea la fecha y hora de la atención para mostrarla en pantalla
function formatearFechaHora(fechaHora) {
    return new Date(fechaHora).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}
 
 
//Convierte una fecha "2026-11-10" en "10/11/2026".
//No se usa new Date() porque interpreta la fecha en UTC y puede mostrar un día menos
function formatearFecha(fecha) {
    if (!fecha) {
        return "-";
    }
 
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
}
 
 
//Las historias viejas pueden no tener peso o temperatura, en ese caso se muestra un guion
function formatearNumero(valor, unidad) {
    return valor === undefined || valor === null || valor === ""
        ? "-"
        : `${valor} ${unidad}`;
}
 
 
function buscarMascota(id) {
    return mascotas.find((mascota) => mascota.idMascota === id);
}
 
function buscarVeterinario(id) {
    return veterinarios.find((veterinario) => veterinario.idVeterinario === id);
}
 
 
//Devuelve las historias ordenadas de la más reciente a la más antigua
function ordenarPorFecha(lista) {
    return [...lista].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
}
 
 
//Datos de una historia listos para mostrar. Si la mascota o el veterinario ya no existen, usa valores por defecto
function datosHistoria(historia) {
    const mascota = buscarMascota(historia.mascota);
    const veterinario = buscarVeterinario(historia.veterinario);
 
    return {
        nombreMascota: mascota ? mascota.nombreMascota : "Desconocida",
        nombreDuenio: mascota ? mascota.nombreDuenio : "-",
        nombreVeterinario: veterinario ? veterinario.nombre : "Sin asignar"
    };
}
 
 
//Devuelve las historias que coinciden con el buscador (mascota, dueño o veterinario)
function historiasFiltradas() {
    const busqueda = buscadorHistoria.value.trim().toLowerCase();
 
    return ordenarPorFecha(historias).filter((historia) => {
        const datos = datosHistoria(historia);
 
        return datos.nombreMascota.toLowerCase().includes(busqueda) ||
            datos.nombreDuenio.toLowerCase().includes(busqueda) ||
            datos.nombreVeterinario.toLowerCase().includes(busqueda);
    });
}
 
 
//Fecha y hora actual en el formato que usa el input datetime-local (ej: 2026-11-07T00:20)
function fechaHoraActual() {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
}
 
 
//No permite elegir una fecha y hora futura para la atención
function actualizarFechaMaxima() {
    inputFechaHora.max = fechaHoraActual();
}
 
 
//Carga las mascotas y los veterinarios en los desplegables del formulario
function cargarDesplegables() {
    mascotas.forEach((mascota) => {
        selectMascota.innerHTML += `<option value="${mascota.idMascota}">${escaparHTML(mascota.nombreMascota)} (${escaparHTML(mascota.nombreDuenio)})</option>`;
    });
 
    veterinarios.forEach((veterinario) => {
        selectVeterinario.innerHTML += `<option value="${veterinario.idVeterinario}">${escaparHTML(veterinario.nombre)} - ${escaparHTML(veterinario.especializacion)}</option>`;
    });
}
 
 
//Carga el historial en la tabla
function render() {
    tabla.innerHTML = "";
 
    const lista = historiasFiltradas();
 
    lista.forEach((historia) => {
        const datos = datosHistoria(historia);
        const existeMascota = Boolean(buscarMascota(historia.mascota));
 
        tabla.innerHTML += `<tr>
            <td>${formatearFechaHora(historia.fechaHora)}</td>
            <td>${escaparHTML(datos.nombreMascota)} (${escaparHTML(datos.nombreDuenio)})</td>
            <td>${escaparHTML(datos.nombreVeterinario)}</td>
            <td>${formatearNumero(historia.peso, "kg")}</td>
            <td>${formatearNumero(historia.temperatura, "°C")}</td>
            <td>${formatearFecha(historia.proximoControl)}</td>
            <td class="observaciones-hc">${escaparHTML(historia.observaciones)}</td>
            <td class="text-center">
                <button class="btn btn-primary btn-sm" ${existeMascota ? "" : "disabled"}
                    onclick="verHistorial('${historia.mascota}')">
                    Ver historial
                </button>
            </td>
        </tr>`;
    });
 
    tabla.innerHTML += lista.length === 0
        ? `<tr><td colspan="8">No hay registros de historia clínica para mostrar.</td></tr>`
        : "";
 
    totalHistorias.textContent = historias.length;
}
 
 
//Muestra en un modal el historial completo de una mascota
function verHistorial(idMascota) {
    const mascota = buscarMascota(idMascota);
 
    if (!mascota) {
        return;
    }
 
    const historiasMascota = ordenarPorFecha(
        historias.filter((historia) => historia.mascota === idMascota)
    );
 
    const imagen = mascota.imagenMascota
        ? `<img src="${mascota.imagenMascota}" alt="Foto de ${escaparHTML(mascota.nombreMascota)}" width="80" height="80" class="rounded-circle object-fit-cover">`
        : "";
 
    const filas = historiasMascota.map((historia) => `<tr>
            <td>${formatearFechaHora(historia.fechaHora)}</td>
            <td>${escaparHTML(datosHistoria(historia).nombreVeterinario)}</td>
            <td>${formatearNumero(historia.peso, "kg")}</td>
            <td>${formatearNumero(historia.temperatura, "°C")}</td>
            <td>${formatearFecha(historia.proximoControl)}</td>
            <td class="observaciones-hc">${escaparHTML(historia.observaciones)}</td>
        </tr>`).join("");
 
    contenidoHistorial.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-3">
            ${imagen}
            <div>
                <h3 class="h5 mb-1">${escaparHTML(mascota.nombreMascota)}</h3>
                <p class="mb-0 small text-muted">
                    Dueño: ${escaparHTML(mascota.nombreDuenio)} ·
                    Color: ${escaparHTML(mascota.color)} ·
                    Edad: ${mascota.edad} · Peso actual: ${mascota.peso} kg
                </p>
            </div>
        </div>
 
        <h4 class="h6 fw-bold">
            Atenciones registradas
            <span class="badge rounded-pill total-historial">${historiasMascota.length}</span>
        </h4>
 
        <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Fecha y hora</th>
                        <th>Veterinario</th>
                        <th>Peso</th>
                        <th>Temperatura</th>
                        <th>Próximo control</th>
                        <th>Observaciones / Diagnóstico</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="6">Esta mascota todavía no tiene atenciones registradas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
 
    modalHistorial.show();
}
 
 
//Guarda el arreglo de historias en LocalStorage
function guardarEnLocalStorage() {
    localStorage.setItem("historiasClinicas", JSON.stringify(historias));
}
 
 
//Prepara un valor para el CSV: lo encierra entre comillas y evita que Excel lo tome como fórmula
function celdaCSV(valor) {
    let texto = String(valor ?? "");
 
    if (/^[=+\-@]/.test(texto)) {
        texto = "'" + texto;
    }
 
    return `"${texto.replace(/"/g, '""')}"`;
}
 
 
//Exporta a CSV las filas que se están mostrando en la tabla
function exportarCSV() {
    const lista = historiasFiltradas();
 
    if (lista.length === 0) {
        mensajeGuardado.textContent = "No hay registros para exportar.";
        modalMensaje.show();
        return;
    }
 
    const encabezado = ["Fecha y hora", "Mascota", "Dueño", "Veterinario", "Peso (kg)", "Temperatura (°C)", "Próximo control", "Observaciones"];
 
    const filas = lista.map((historia) => {
        const datos = datosHistoria(historia);
 
        return [
            formatearFechaHora(historia.fechaHora),
            datos.nombreMascota,
            datos.nombreDuenio,
            datos.nombreVeterinario,
            historia.peso ?? "",
            historia.temperatura ?? "",
            historia.proximoControl ? formatearFecha(historia.proximoControl) : "",
            historia.observaciones
        ].map(celdaCSV).join(";");
    });
 
    //El ﻿ al inicio hace que Excel muestre bien las tildes
    const contenido = "﻿" + [encabezado.map(celdaCSV).join(";"), ...filas].join("\r\n");
 
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
    enlace.download = "historia_clinica.csv";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
}
 
 
//Actualiza el peso actual de la mascota con el de su atención más reciente.
//Se usa la fecha de la atención (no el orden de carga) 
//para que cargar una atención vieja no pise un peso más nuevo
function actualizarPesoMascota(idMascota) {
    const mascota = buscarMascota(idMascota);
 
    const ultimaAtencion = ordenarPorFecha(
        historias.filter((historia) => historia.mascota === idMascota && !isNaN(historia.peso))
    )[0];
 
    if (!mascota || !ultimaAtencion) {
        return;
    }
 
    mascota.peso = ultimaAtencion.peso;
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
}
 
 
//Este evento registra una atención en la historia clínica
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
 
    if (inputFechaHora.value > fechaHoraActual()) {
        mensajeGuardado.textContent = "La fecha de la atención no puede ser futura.";
        modalMensaje.show();
        return;
    }
 
    const nuevaHistoria = {
        idHistoriaClinica: crypto.randomUUID(),
        mascota: selectMascota.value,
        veterinario: selectVeterinario.value,
        fechaHora: document.getElementById("fechaHoraHC").value,
        peso: parseFloat(document.getElementById("pesoHC").value),
        temperatura: parseFloat(document.getElementById("temperaturaHC").value),
        proximoControl: document.getElementById("proximoControlHC").value,
        observaciones: document.getElementById("observacionesHC").value.trim()
    };
 
    historias.push(nuevaHistoria);
 
    guardarEnLocalStorage();
    actualizarPesoMascota(nuevaHistoria.mascota);
    render();
    formulario.reset();
 
    mensajeGuardado.textContent = "La historia clínica se guardó correctamente.";
    modalMensaje.show();
});
 
 
//Actualizamos el listado cada vez que se escribe en el buscador
buscadorHistoria.addEventListener("input", render);
 
botonExportar.addEventListener("click", exportarCSV);
 
 
inputFechaHora.addEventListener("focus", actualizarFechaMaxima);
setInterval(actualizarFechaMaxima, 60000);
 
 
//Mostramos los datos cuando se carga la página
actualizarFechaMaxima();
cargarDesplegables();
render();
 