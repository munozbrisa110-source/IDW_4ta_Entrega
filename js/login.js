// ENDPOINT
const AUTH_URL = "https://dummyjson.com/auth/login";

const formulario = document.getElementById('form-sesion');
const mensajeError = document.getElementById('mensajeError');
const botonForm = document.getElementById('botonIniciarSesion');


formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    mensajeError.textContent = '';
    botonForm.disabled = true;
    botonForm.textContent = 'Cargando...'

    // procesar los datos del formulario
    // y enviarlos por POST con fetch a dummyjson para simular el inicio de sesión
    try {
        const datosForm = new FormData(formulario);
     
        const usuario = {
            username: datosForm.get('nombreUsuario').trim(),
            password: datosForm.get('contrasenia').trim()
        }

        const respuesta = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        if (!respuesta.ok) {
            mensajeError.textContent = 'Usuario y/o contraseña incorrectos.';
            return
        }

        const datos = await respuesta.json();
        console.log(datos);

        sessionStorage.setItem('accessToken', datos.accessToken)
        sessionStorage.setItem('usuario', datos.firstName)
        
        window.location.href = './panelAdmin.html';


    } catch (error) {
        mensajeError.textContent = 'Ocurrió un error al iniciar sesión, intente nuevamente mas tarde.'
        console.error(error);
    } finally {
        botonForm.disabled = false;
        botonForm.textContent = 'Iniciar Sesión'
    }

})
