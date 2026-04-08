(() => {
const App = window.Talentea

App.registrarEventosInterfaz = () => {
    App.elementos.botonTema.addEventListener("click", App.cambiarTema)
    App.elementos.mostrarLogin.addEventListener("click", () => App.mostrarFormularioAcceso("login"))
    App.elementos.mostrarRegistro.addEventListener("click", () => App.mostrarFormularioAcceso("registro"))

    App.elementos.botonCerrarSesion.addEventListener("click", () => {
        App.guardarSesion(null)
        App.restablecerValoracionFijada()
        App.estado.seccionActiva = "inicio"
        App.mostrarFormularioAcceso("login")
        App.mostrarAviso("Sesion cerrada")
    })

    App.elementos.navegacionPanel.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-seccion]")
        if (!boton) {
            return
        }

        if (boton.dataset.seccion === "valoraciones") {
            App.restablecerValoracionFijada()
            App.cargarOpcionesValoracion().catch((error) => App.mostrarAviso(error.message, true))
        }

        App.mostrarSeccion(boton.dataset.seccion)
    })

    App.elementos.botonActualizarProyectos.addEventListener("click", App.cargarProyectos)
    App.elementos.botonActualizarCreativos.addEventListener("click", App.cargarTalento)
    App.elementos.busquedaProyecto.addEventListener("input", App.cargarProyectos)
    App.elementos.categoriaProyecto.addEventListener("input", App.cargarProyectos)
    App.elementos.busquedaCreativo.addEventListener("input", App.cargarTalento)
    App.elementos.categoriaCreativo.addEventListener("input", App.cargarTalento)
    App.elementos.selectorProyectoValoracion.addEventListener("change", (evento) => {
        App.poblarDestinatariosValoracion(evento.target.value)
    })

    document.addEventListener("click", async (evento) => {
        const tarjetaProyecto = evento.target.closest("[data-id-proyecto]")
        if (tarjetaProyecto && !evento.target.closest("button")) {
            try {
                await App.abrirProyecto(tarjetaProyecto.dataset.idProyecto)
            } catch (error) {
                App.mostrarAviso(error.message, true)
            }
            return
        }

        const tarjetaUsuario = evento.target.closest("[data-id-usuario]")
        if (tarjetaUsuario && !evento.target.closest("button")) {
            try {
                await App.abrirPerfil(tarjetaUsuario.dataset.idUsuario)
            } catch (error) {
                App.mostrarAviso(error.message, true)
            }
            return
        }

        const boton = evento.target.closest("button[data-accion]")
        if (!boton) {
            return
        }

        const { accion, id, estado: nuevoEstado, valor } = boton.dataset

        try {
            if (accion === "postularse") {
                const cartaPresentacion = window.prompt("Escribe una breve propuesta para la empresa")
                if (cartaPresentacion === null) return

                await App.llamarApi("/api/candidaturas", {
                    method: "POST",
                    body: JSON.stringify({
                        idProyecto: id,
                        cartaPresentacion,
                        enlacesPortafolio: (App.estado.usuario?.portafolio || [])
                            .map((item) => item.urlProyecto || item.urlMedia)
                            .filter(Boolean)
                    })
                })
                App.mostrarAviso("Candidatura enviada")
            }

            if (accion === "ver-proyecto") {
                await App.abrirProyecto(id)
                return
            }

            if (accion === "ver-perfil") {
                await App.abrirPerfil(boton.dataset.idUsuario, boton.dataset.idProyecto || "")
                return
            }

        if (accion === "abrir-valoracion") {
            await App.abrirSeccionValoraciones(boton.dataset.idProyecto || "", boton.dataset.idUsuario || "")
            App.mostrarAviso("Selecciona proyecto y persona para valorar")
            return
        }

        if (accion === "eliminar-muestra") {
            const indice = Number(boton.dataset.indiceMuestra)
            App.estado.portafolioEdicion = (App.estado.portafolioEdicion || []).filter((_, posicion) => posicion !== indice)
            App.renderizarPortafolioEditable()
            App.mostrarAviso("Muestra eliminada")
            return
        }

            if (accion === "cambiar-estado") {
                await App.llamarApi(`/api/candidaturas/${id}/estado`, {
                    method: "PATCH",
                    body: JSON.stringify({ estado: nuevoEstado })
                })
                App.mostrarAviso("Estado actualizado")
            }

            if (accion === "completar-proyecto") {
                await App.llamarApi(`/api/proyectos/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ estado: "completado" })
                })
                App.mostrarAviso("Proyecto marcado como completado")
            }

            if (accion === "eliminar-proyecto") {
                const confirmar = window.confirm("¿Quieres eliminar este proyecto? Esta accion no se puede deshacer.")
                if (!confirmar) {
                    return
                }

                await App.llamarApi(`/api/proyectos/${id}`, {
                    method: "DELETE"
                })
                App.mostrarAviso("Proyecto eliminado")
                App.elementos.modalProyecto.classList.add("hidden")
            }

            if (accion === "verificar") {
                await App.llamarApi(`/api/administracion/usuarios/${id}/verificacion`, {
                    method: "PATCH",
                    body: JSON.stringify({ verificado: valor === "true" })
                })
                App.mostrarAviso("Verificacion actualizada")
            }

            await Promise.all([App.cargarProyectos(), App.cargarTalento(), App.cargarVistasPrivadas()])
        } catch (error) {
            App.mostrarAviso(error.message, true)
        }
    })

    App.elementos.cerrarModalProyecto.addEventListener("click", () => {
        App.elementos.modalProyecto.classList.add("hidden")
    })

    App.elementos.modalProyecto.addEventListener("click", (evento) => {
        if (evento.target.dataset.cerrarModal === "true") {
            App.elementos.modalProyecto.classList.add("hidden")
        }
    })

    App.elementos.cerrarModalPerfil.addEventListener("click", () => {
        App.elementos.modalPerfil.classList.add("hidden")
    })

    App.elementos.modalPerfil.addEventListener("click", (evento) => {
        if (evento.target.dataset.cerrarModalPerfil === "true") {
            App.elementos.modalPerfil.classList.add("hidden")
        }
    })
}
})()
