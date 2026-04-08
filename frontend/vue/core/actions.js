window.TalenteaActions = {
    async llamarApi(url, opciones = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`
        }

        const respuesta = await fetch(url, { ...opciones, headers })
        const datos = await respuesta.json().catch(() => ({}))
        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "No se pudo completar la operacion")
        }
        return datos
    },
    mostrarAviso(mensaje, error = false) {
        this.aviso = { mensaje, visible: true, error }
        clearTimeout(this.temporizadorAviso)
        this.temporizadorAviso = setTimeout(() => {
            this.aviso.visible = false
        }, 2600)
    },
    aplicarTema() {
        document.body.dataset.tema = this.tema
        localStorage.setItem("talentea_tema", this.tema)
    },
    cambiarTema() {
        this.tema = this.tema === "oscuro" ? "claro" : "oscuro"
    },
    guardarSesion(datosSesion) {
        this.token = datosSesion?.token || ""
        this.usuario = datosSesion?.usuario || null

        if (this.token && this.usuario) {
            localStorage.setItem("talentea_token", this.token)
            localStorage.setItem("talentea_usuario", JSON.stringify(this.usuario))
            this.rellenarPerfilDesdeSesion()
        } else {
            localStorage.removeItem("talentea_token")
            localStorage.removeItem("talentea_usuario")
        }
    },
    async inicializar() {
        this.aplicarTema()
        await this.cargarEmpresasInicio()
        if (this.token) {
            try {
                await this.refrescarUsuarioActual()
            } catch {
                this.guardarSesion(null)
            }
        }
        await Promise.all([this.cargarProyectos(), this.cargarTalento(), this.cargarVistasPrivadas()])
    },
    async refrescarUsuarioActual() {
        const datos = await this.llamarApi("/api/autenticacion/mi-perfil")
        this.guardarSesion({ token: this.token, usuario: datos.usuario })
    },
    rellenarPerfilDesdeSesion() {
        const usuario = this.usuario
        if (!usuario) return
        this.perfil = {
            nombre: usuario.nombre || "",
            fotoPerfil: usuario.fotoPerfil || "",
            estudios: usuario.estudios || usuario.titular || "",
            ubicacion: usuario.ubicacion || "",
            web: usuario.web || "",
            nombreEmpresa: usuario.nombreEmpresa || "",
            categorias: (usuario.categorias || []).join(", "),
            habilidades: (usuario.habilidades || []).join(", "),
            intereses: (usuario.intereses || []).join(", "),
            biografia: usuario.biografia || ""
        }
        this.portafolioEdicion = [...(usuario.portafolio || [])]
    },
    cerrarSesion() {
        this.guardarSesion(null)
        this.seccionActiva = "inicio"
        this.vistaAcceso = "login"
        this.mostrarAviso("Sesion cerrada")
    },
    async cargarEmpresasInicio() {
        const datos = await this.llamarApi("/api/usuarios?rol=empresa&limite=4")
        this.empresasInicio = datos.elementos || []
    },
    async cargarProyectos() {
        const parametros = new URLSearchParams()
        if (this.filtros.busquedaProyecto.trim()) parametros.set("palabraClave", this.filtros.busquedaProyecto.trim())
        if (this.filtros.categoriaProyecto.trim()) parametros.set("categoria", this.filtros.categoriaProyecto.trim())
        const datos = await this.llamarApi(`/api/proyectos?${parametros.toString()}`)
        this.proyectos = datos.elementos || []
    },
    async cargarTalento() {
        const parametros = new URLSearchParams()
        if (this.filtros.busquedaTalento.trim()) parametros.set("palabraClave", this.filtros.busquedaTalento.trim())
        if (this.filtros.categoriaTalento.trim()) parametros.set("categoria", this.filtros.categoriaTalento.trim())
        const datos = await this.llamarApi(`/api/usuarios?${parametros.toString()}`)
        this.talento = datos.elementos || []
    },
    async cargarVistasPrivadas() {
        if (!this.usuario) return
        if (this.esRolUsuario(this.usuario)) {
            const datos = await this.llamarApi("/api/candidaturas/mias")
            this.misCandidaturas = datos.elementos || []
        }
        if (this.usuario.rol === "empresa") {
            const datos = await this.llamarApi(`/api/proyectos?idEmpresa=${this.usuario._id}`)
            this.proyectosEmpresa = await Promise.all(
                (datos.elementos || []).map(async (proyecto) => {
                    const candidaturas = await this.llamarApi(`/api/candidaturas/proyecto/${proyecto._id}`)
                    return { ...proyecto, candidaturas: candidaturas.elementos || [] }
                })
            )
        }
        await this.cargarOpcionesValoracion()
    },
    async abrirProyecto(idProyecto) {
        const datos = await this.llamarApi(`/api/proyectos/${idProyecto}`)
        this.modalProyecto = datos.proyecto
    },
    async abrirPerfil(idUsuario, contextoProyecto = "") {
        const [datosPerfil, datosValoraciones, opcionesValoracion] = await Promise.all([
            this.llamarApi(`/api/usuarios/${idUsuario}`),
            this.llamarApi(`/api/valoraciones/usuario/${idUsuario}`),
            this.usuario ? this.obtenerOpcionesValorablesPorPersona(idUsuario).catch(() => []) : Promise.resolve([])
        ])
        this.modalPerfil = {
            usuario: datosPerfil.usuario,
            valoraciones: datosValoraciones.elementos || [],
            proyectoContexto: contextoProyecto,
            puedeValorar:
                Array.isArray(opcionesValoracion) &&
                opcionesValoracion.length > 0 &&
                (!contextoProyecto || opcionesValoracion.some((proyecto) => proyecto.id === contextoProyecto))
        }
    },
    async abrirModalCandidatura(idProyecto) {
        const datos = await this.llamarApi(`/api/proyectos/${idProyecto}`)
        this.modalProyecto = datos.proyecto
        this.candidaturaFormulario = { idProyecto: datos.proyecto._id, cartaPresentacion: "" }
        this.modalCandidatura = true
    },
    async enviarCandidatura() {
        await this.llamarApi("/api/candidaturas", {
            method: "POST",
            body: JSON.stringify({
                idProyecto: this.candidaturaFormulario.idProyecto,
                cartaPresentacion: this.candidaturaFormulario.cartaPresentacion,
                enlacesPortafolio: (this.usuario?.portafolio || [])
                    .map((item) => item.urlProyecto || item.urlMedia)
                    .filter(Boolean)
            })
        })
        this.modalCandidatura = false
        this.mostrarAviso("Candidatura enviada")
        await this.cargarVistasPrivadas()
    },
    async obtenerOpcionesValorablesPorPersona(idDestinatario) {
        const parametros = new URLSearchParams({ idDestinatario })
        const datos = await this.llamarApi(`/api/valoraciones/opciones?${parametros.toString()}`)
        return datos.elementos || []
    },
    async cargarOpcionesValoracion(idProyecto = "", idDestinatario = "") {
        if (!this.usuario) return
        const destinatarioActivo = this.valoracionFijada.idDestinatario || idDestinatario
        const parametros = new URLSearchParams()
        if (destinatarioActivo) parametros.set("idDestinatario", destinatarioActivo)
        const sufijo = parametros.toString() ? `?${parametros.toString()}` : ""
        const datos = await this.llamarApi(`/api/valoraciones/opciones${sufijo}`)
        this.opcionesValoracion = datos.elementos || []
        const proyectoInicial = idProyecto || this.opcionesValoracion[0]?.id || ""
        this.valoracionFormulario.idProyecto = proyectoInicial
        this.valoracionFormulario.idDestinatario = destinatarioActivo || (this.opcionesValoracion[0]?.destinatarios?.[0]?.id || "")
    },
    async abrirValoracion(idUsuario, idProyecto = "") {
        this.valoracionFijada = { idDestinatario: idUsuario || "", bloqueada: Boolean(idUsuario) }
        await this.cargarOpcionesValoracion(idProyecto, idUsuario)
        if (idUsuario && this.opcionesValoracion.length === 0) {
            this.valoracionFijada = { idDestinatario: "", bloqueada: false }
            throw new Error("Solo puedes valorar a personas aceptadas en proyectos completados")
        }
        this.modalPerfil = null
        this.modalProyecto = null
        this.seccionActiva = "valoraciones"
        if (this.valoracionFijada.bloqueada) {
            this.valoracionFormulario.idDestinatario = this.valoracionFijada.idDestinatario
        }
    },
    seleccionarSeccion(id) {
        if (id === "valoraciones") {
            this.valoracionFijada = { idDestinatario: "", bloqueada: false }
            this.valoracionFormulario = { idProyecto: "", idDestinatario: "", puntuacion: "", comentario: "" }
            this.cargarOpcionesValoracion().catch((error) => this.mostrarAviso(error.message, true))
        }
        this.seccionActiva = id
    }
}
