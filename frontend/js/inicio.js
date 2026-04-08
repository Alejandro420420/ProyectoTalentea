(() => {
const App = window.Talentea

App.iniciarAplicacion = async () => {
    App.aplicarTema()
    App.mostrarFormularioAcceso("login")
    App.registrarEventosFormularios()
    App.registrarEventosInterfaz()

    try {
        if (App.estado.token) {
            await App.refrescarUsuarioActual()
            await Promise.all([App.cargarProyectos(), App.cargarTalento(), App.cargarVistasPrivadas()])
        } else {
            App.actualizarInterfazGeneral()
        }
    } catch (error) {
        App.guardarSesion(null)
        App.mostrarAviso("La sesion habia expirado", true)
    }
}

window.addEventListener("DOMContentLoaded", () => {
    App.iniciarAplicacion()
})
})()
