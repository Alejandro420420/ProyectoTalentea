(() => {
const App = window.Talentea

App.refrescarUsuarioActual = async () => {
    if (!App.estado.token) {
        return
    }

    const datos = await App.llamarApi("/api/autenticacion/mi-perfil")
    App.guardarSesion({ token: App.estado.token, usuario: datos.usuario })
}

App.mostrarFormularioAcceso = (tipo) => {
    const esLogin = tipo === "login"
    App.elementos.formularioLogin.classList.toggle("hidden", !esLogin)
    App.elementos.formularioRegistro.classList.toggle("hidden", esLogin)
    App.elementos.mostrarLogin.classList.toggle("activa", esLogin)
    App.elementos.mostrarRegistro.classList.toggle("activa", !esLogin)
}

App.registrarEventosFormularios = () => {
    App.elementos.botonSubirArchivoPortafolio.addEventListener("click", async () => {
        const archivo = App.elementos.archivoPortafolio.files?.[0]
        if (!archivo) {
            App.mostrarAviso("Selecciona un archivo primero", true)
            return
        }

        const lector = new FileReader()
        lector.onload = async () => {
            try {
                const contenidoBase64 = String(lector.result).split(",")[1] || ""
                const subida = await App.llamarApi("/api/usuarios/subidas", {
                    method: "POST",
                    body: JSON.stringify({
                        nombreArchivo: archivo.name,
                        tipoMime: archivo.type,
                        contenidoBase64
                    })
                })

                const elementoPortafolio = {
                    titulo: App.elementos.tituloArchivoPortafolio.value.trim() || archivo.name,
                    descripcion: App.elementos.descripcionArchivoPortafolio.value.trim(),
                    categoria: App.elementos.categoriaArchivoPortafolio.value.trim(),
                    urlMedia: subida.archivo.url,
                    urlProyecto: subida.archivo.url
                }

                App.estado.portafolioEdicion = [...(App.estado.portafolioEdicion || []), elementoPortafolio]
                App.renderizarPortafolioEditable()

                App.elementos.archivoPortafolio.value = ""
                App.elementos.tituloArchivoPortafolio.value = ""
                App.elementos.categoriaArchivoPortafolio.value = ""
                App.elementos.descripcionArchivoPortafolio.value = ""
                App.mostrarAviso("Archivo subido al portfolio")
            } catch (error) {
                App.mostrarAviso(error.message, true)
            }
        }

        lector.readAsDataURL(archivo)
    })

    App.elementos.formularioRegistro.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        try {
            const datosFormulario = new FormData(evento.currentTarget)
            const cuerpo = Object.fromEntries(datosFormulario.entries())
            const datos = await App.llamarApi("/api/autenticacion/registro", {
                method: "POST",
                body: JSON.stringify(cuerpo)
            })
            App.guardarSesion(datos)
            App.mostrarAviso("Cuenta creada correctamente")
            await Promise.all([App.cargarProyectos(), App.cargarTalento(), App.cargarVistasPrivadas()])
        } catch (error) {
            App.mostrarAviso(error.message, true)
        }
    })

    App.elementos.formularioLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        try {
            const datosFormulario = new FormData(evento.currentTarget)
            const cuerpo = Object.fromEntries(datosFormulario.entries())
            const datos = await App.llamarApi("/api/autenticacion/login", {
                method: "POST",
                body: JSON.stringify(cuerpo)
            })
            App.guardarSesion(datos)
            App.mostrarAviso("Sesion iniciada")
            await Promise.all([App.cargarProyectos(), App.cargarTalento(), App.cargarVistasPrivadas()])
        } catch (error) {
            App.mostrarAviso(error.message, true)
        }
    })

    App.elementos.formularioPerfil.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        try {
            const datosFormulario = new FormData(evento.currentTarget)
            const cuerpo = Object.fromEntries(datosFormulario.entries())
            cuerpo.portafolio = App.estado.portafolioEdicion || []
            const datos = await App.llamarApi("/api/usuarios/mi-perfil", {
                method: "PUT",
                body: JSON.stringify(cuerpo)
            })
            App.guardarSesion({ token: App.estado.token, usuario: datos.usuario })
            App.mostrarAviso("Perfil actualizado")
            await App.cargarTalento()
        } catch (error) {
            App.mostrarAviso(error.message, true)
        }
    })

    App.elementos.formularioProyecto.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        if (App.estado.enviandoProyecto) {
            return
        }

        try {
            App.estado.enviandoProyecto = true
            const formulario = evento.currentTarget
            const datosFormulario = new FormData(formulario)
            const cuerpo = Object.fromEntries(datosFormulario.entries())
            cuerpo.remoto = datosFormulario.get("remoto") === "on"
            cuerpo.salario = Number(cuerpo.salario || 0)
            await App.llamarApi("/api/proyectos", {
                method: "POST",
                body: JSON.stringify(cuerpo)
            })
            formulario.reset()
            App.mostrarAviso("Proyecto publicado")
            App.mostrarSeccion("gestion-empresa")
            await Promise.all([App.cargarProyectos(), App.cargarVistasPrivadas()])
        } catch (error) {
            App.mostrarAviso(error.message, true)
        } finally {
            App.estado.enviandoProyecto = false
        }
    })

    App.elementos.formularioValoracion.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        try {
            const datosFormulario = new FormData(evento.currentTarget)
            const cuerpo = Object.fromEntries(datosFormulario.entries())
            if (!cuerpo.idProyecto || !cuerpo.idDestinatario) {
                App.mostrarAviso("Selecciona un proyecto y una persona validos antes de valorar", true)
                return
            }
            cuerpo.puntuacion = Number(cuerpo.puntuacion)
            await App.llamarApi("/api/valoraciones", {
                method: "POST",
                body: JSON.stringify(cuerpo)
            })
            evento.currentTarget.reset()
            App.restablecerValoracionFijada()
            App.poblarDestinatariosValoracion("")
            App.mostrarAviso("Valoracion enviada")
            await Promise.all([App.cargarTalento(), App.cargarOpcionesValoracion()])
        } catch (error) {
            App.mostrarAviso(error.message, true)
        }
    })
}
})()
