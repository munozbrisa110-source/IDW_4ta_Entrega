const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

const tablaMascotas = document.getElementById("tablaMascotas");
const totalMascotas = document.getElementById("totalMascotas");
const formulario = document.getElementById("formularioMascota");
const buscadorMascotas = document.getElementById("buscadorMascotas");

const formularioEditar = document.getElementById("formularioEditarMascota");
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarMascota"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminarMascota"));
const modalMensaje = new bootstrap.Modal(document.getElementById("modalMensaje"));

const mensajeGuardado = document.getElementById("mensajeGuardado");

let idMascotaEditar;
let idMascotaEliminar;


//Recibe el id de la mascota que se quiere eliminar
function eliminarMascota(id) {
    idMascotaEliminar = id;
    modalEliminar.show();
}


//Busca la mascota y carga sus datos en el formulario de editar
function editarMascota(id) {
    idMascotaEditar = id;

    const mascota = mascotas.find((mascota) => mascota.idMascota === id);

    document.getElementById("editarNombreDuenio").value = mascota.nombreDuenio;
    document.getElementById("editarNombreMascota").value = mascota.nombreMascota;
    document.getElementById("editarColor").value = mascota.color;
    document.getElementById("editarEdad").value = mascota.edad;
    document.getElementById("editarPeso").value = mascota.peso;
    document.getElementById("editarImagen").value = "";

    modalEditar.show();
}


//Carga las mascotas en la tabla.
function render() {
    tablaMascotas.innerHTML = "";

    const busqueda = buscadorMascotas.value.trim().toLowerCase();

    const mascotasFiltradas = mascotas.filter((mascota) =>
        mascota.nombreMascota.toLowerCase().includes(busqueda) ||
        mascota.nombreDuenio.toLowerCase().includes(busqueda) 
    );

    //Recorre las mascotas filtradas y muestra su foto si tienen una registrada
    mascotasFiltradas.forEach((mascota) => {
        //Verifica si la mascota tiene una foto y la muestra
        //Si no, indica "Sin foto"
        const imagen = mascota.imagenMascota
            ? `<img src="${mascota.imagenMascota}" alt="Foto de ${mascota.nombreMascota}" width="70" height="35" class="object-fit-cover">`
            : "Sin foto";

        tablaMascotas.innerHTML += `<tr>
            <td>${mascota.nombreDuenio}</td>
            <td>${mascota.nombreMascota}</td>
            <td>${mascota.color}</td>
            <td>${mascota.edad}</td>
            <td>${mascota.peso}</td>
            <td>${imagen}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1 mb-1 mb-sm-0 d-block d-sm-inline-block"
                    onclick="editarMascota('${mascota.idMascota}')">
                    Editar
                </button>

                <button class="btn btn-danger btn-sm d-block d-sm-inline-block"
                    onclick="eliminarMascota('${mascota.idMascota}')">
                    Eliminar
                </button>
            </td>
        </tr>`;
    });

    tablaMascotas.innerHTML += mascotasFiltradas.length === 0
        ? `<tr><td colspan="7">No hay mascotas para mostrar.</td></tr>`
        : "";

    totalMascotas.textContent = mascotas.length;
}


//Mostramos las mascotas cuando se carga la página
render();


//Guarda el arreglo de mascotas en LocalStorage
function guardarEnLocalStorage() {
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
}


//Convierte la imagen en una cadena Base64
function leerImagen(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();

        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(lector.error);

        lector.readAsDataURL(archivo);
    });
}


//Este evento registra una mascota
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const archivo = datos.get("imagen");

    const imagenMascota = archivo && archivo.size > 0
        ? await leerImagen(archivo)
        : "";

    const nuevaMascota = {
        idMascota: crypto.randomUUID(),
        nombreDuenio: datos.get("nombreDuenio").trim(),
        nombreMascota: datos.get("nombreMascota").trim(),
        color: datos.get("color").trim(),
        edad: Number(datos.get("edad")),
        peso: parseFloat(datos.get("peso")),
        imagenMascota: imagenMascota
    };

    mascotas.push(nuevaMascota);

    guardarEnLocalStorage();
    render();
    formulario.reset();

    mensajeGuardado.textContent = "La mascota se registró correctamente.";
    modalMensaje.show();
});


//Guarda los cambios realizados en una mascota
formularioEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
        const datos = new FormData(formularioEditar);

        const mascota = mascotas.find(
            (mascota) => mascota.idMascota === idMascotaEditar
        );

        const archivo = datos.get("editarImagen");

        mascota.nombreDuenio = datos.get("editarNombreDuenio").trim();
        mascota.nombreMascota = datos.get("editarNombreMascota").trim();
        mascota.color = datos.get("editarColor").trim();
        mascota.edad = Number(datos.get("editarEdad"));
        mascota.peso = parseFloat(datos.get("editarPeso"));

        mascota.imagenMascota = archivo && archivo.size > 0
            ? await leerImagen(archivo)
            : mascota.imagenMascota;

        guardarEnLocalStorage();
        render();
        formularioEditar.reset();
        modalEditar.hide();
        idMascotaEditar = null;

        mensajeGuardado.textContent = "Los cambios se guardaron correctamente.";
        modalEditar._element.addEventListener("hidden.bs.modal", () => {
            modalMensaje.show();
        }, { once: true });

    } catch (error) {
        console.error(error);
    }
});


//Elimina la mascota cuando se confirma la acción
document.getElementById("confirmarEliminarMascota").addEventListener("click", () => {
    const indice = mascotas.findIndex(
        (mascota) => mascota.idMascota === idMascotaEliminar
    );

    mascotas.splice(indice, 1);

    guardarEnLocalStorage();
    render();
    modalEliminar.hide();
    idMascotaEliminar = null;

    mensajeGuardado.textContent = "La mascota se eliminó correctamente.";
    modalEliminar._element.addEventListener("hidden.bs.modal", () => {
        modalMensaje.show();
    }, { once: true });
});


//Actualizamos el listado cada vez que se escribe en el buscador
buscadorMascotas.addEventListener("input", render);
