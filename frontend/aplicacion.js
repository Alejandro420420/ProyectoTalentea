const estado = {
    token: localStorage.getItem("talentea_token") || "",
    usuario: JSON.parse(localStorage.getItem("talentea_usuario") || "null"),
    tema: localStorage.getItem("talentea_tema") || "oscuro",
    seccionActiva: "inicio",
    enviandoProyecto: false,
    valoracionFijada: {
        idDestinatario: "",
        bloqueada: false
    }
}

const seleccionar = (selector) => document.querySelector(selector)

const elementos = {
    cuerpo: document.body,
    vistaAcceso: seleccionar("#vistaAcceso"),
    vistaPanel: seleccionar("#vistaPanel"),
    estadoSesion: seleccionar("#estadoSesion"),
    botonTema: seleccionar("#botonTema"),
    botonCerrarSesion: seleccionar("#botonCerrarSesion"),
    mostrarLogin: seleccionar("#mostrarLogin"),
    mostrarRegistro: seleccionar("#mostrarRegistro"),
    formularioLogin: seleccionar("#formularioLogin"),
    formularioRegistro: seleccionar("#formularioRegistro"),
    formularioPerfil: seleccionar("#formularioPerfil"),
    formularioProyecto: seleccionar("#formularioProyecto"),
    formularioValoracion: seleccionar("#formularioValoracion"),
    botonActualizarProyectos: seleccionar("#botonActualizarProyectos"),
    botonActualizarCreativos: seleccionar("#botonActualizarCreativos"),
    busquedaProyecto: seleccionar("#busquedaProyecto"),
    categoriaProyecto: seleccionar("#categoriaProyecto"),
    busquedaCreativo: seleccionar("#busquedaCreativo"),
    categoriaCreativo: seleccionar("#categoriaCreativo"),
    listaProyectos: seleccionar("#listaProyectos"),
    listaCreativos: seleccionar("#listaCreativos"),
    listaMisCandidaturas: seleccionar("#listaMisCandidaturas"),
    listaProyectosEmpresa: seleccionar("#listaProyectosEmpresa"),
    metricasAdministracion: seleccionar("#metricasAdministracion"),
    listaUsuariosAdmin: seleccionar("#listaUsuariosAdmin"),
    listaAuditoria: seleccionar("#listaAuditoria"),
    modalProyecto: seleccionar("#modalProyecto"),
    cerrarModalProyecto: seleccionar("#cerrarModalProyecto"),
    detalleProyecto: seleccionar("#detalleProyecto"),
    modalPerfil: seleccionar("#modalPerfil"),
    cerrarModalPerfil: seleccionar("#cerrarModalPerfil"),
    detallePerfil: seleccionar("#detallePerfil"),
    navegacionPanel: seleccionar("#navegacionPanel"),
    panelEmpresa: seleccionar("#panelEmpresa"),
    panelCandidaturas: seleccionar("#panelCandidaturas"),
    panelProyectosEmpresa: seleccionar("#panelProyectosEmpresa"),
    panelAdministracion: seleccionar("#panelAdministracion"),
    panelValoracion: seleccionar("#panelValoracion"),
    selectorProyectoValoracion: seleccionar("#selectorProyectoValoracion"),
    selectorDestinatarioValoracion: seleccionar("#selectorDestinatarioValoracion"),
    aviso: seleccionar("#aviso")
}

let opcionesValoracion = []

const esRolUsuario = (usuario) => usuario?.rol === "usuario" || usuario?.rol === "creativo"

const obtenerTextoRol = (rol) => {
    if (rol === "creativo") return "usuario"
    return rol || ""
}

const obtenerIniciales = (texto = "") =>
    texto
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() || "")
        .join("")

const renderizarAvatar = (entidad, nombreAlternativo) => {
    const foto = entidad?.fotoPerfil
    const nombre = entidad?.nombreEmpresa || entidad?.nombre || nombreAlternativo || "Perfil"

    if (foto) {
        return `<img class="foto-perfil" src="${foto}" alt="${nombre}" />`
    }

    return `<div class="foto-placeholder">${obtenerIniciales(nombre)}</div>`
}

const seccionesBase = [
    { id: "inicio", etiqueta: "Inicio" },
    { id: "perfil", etiqueta: "Perfil" },
    { id: "proyectos", etiqueta: "Proyectos" },
    { id: "talento", etiqueta: "Talento" }
]

const mostrarAviso = (mensaje, esError = false) => {
    elementos.aviso.textContent = mensaje
    elementos.aviso.style.background = esError ? "rgba(173, 60, 44, 0.94)" : "rgba(20, 14, 32, 0.94)"
    elementos.aviso.classList.add("show")
    clearTimeout(mostrarAviso.temporizador)
    mostrarAviso.temporizador = setTimeout(() => elementos.aviso.classList.remove("show"), 2600)
}

const aplicarTema = () => {
    elementos.cuerpo.dataset.tema = estado.tema
    elementos.botonTema.textContent = estado.tema === "oscuro" ? "\u263D" : "\u2600"
    localStorage.setItem("talentea_tema", estado.tema)
}

const cambiarTema = () => {
    estado.tema = estado.tema === "claro" ? "claro" : "oscuro"
    aplicarTema()
}

const guardarSesion = (datosSesion) => {
    estado.token = datosSesion?.token || ""
    estado.usuario = datosSesion?.usuario || null

    if (estado.token && estado.usuario) {
        localStorage.setItem("talentea_token", estado.token)
        localStorage.setItem("talentea_usuario", JSON.stringify(estado.usuario))
    } else {
        localStorage.removeItem("talentea_token")
        localStorage.removeItem("talentea_usuario")
    }

    actualizarInterfazGeneral()
}

const llamarApi = async (url, opciones = {}) => {
    const encabezados = {
        "Content-Type": "application/json",
        ...(opciones.headers || {})
    }

    if (estado.token) {
        encabezados.Authorization = `Bearer ${estado.token}`
    }

    const respuesta = await fetch(url, { ...opciones, headers: encabezados })
    const datos = await respuesta.json().catch(() => ({}))

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo completar la operacion")
    }

    return datos
}

const construirNavegacion = () => {
    const iconosGrupo = {
        Base: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        Usuario: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        Empresa: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7m-9 0h10.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-8A2.5 2.5 0 0 1 6.5 7H7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.8"/></svg>',
        Admin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    }

    const grupos = [
        { titulo: "Base", secciones: [...seccionesBase] }
    ]

    if (esRolUsuario(estado.usuario)) {
        grupos.push({
            titulo: "Usuario",
            secciones: [
                { id: "mis-candidaturas", etiqueta: "Mis candidaturas" },
                { id: "valoraciones", etiqueta: "Valorar trabajo" }
            ]
        })
    }

    if (estado.usuario?.rol === "empresa") {
        grupos.push({
            titulo: "Empresa",
            secciones: [
                { id: "empresa", etiqueta: "Publicar proyecto" },
                { id: "gestion-empresa", etiqueta: "Gestionar candidaturas" },
                { id: "valoraciones", etiqueta: "Valorar trabajo" }
            ]
        })
    }

    if (estado.usuario?.rol === "admin") {
        grupos.push({
            titulo: "Admin",
            secciones: [{ id: "administracion", etiqueta: "Administracion" }]
        })
    }

    elementos.navegacionPanel.innerHTML = grupos
        .map(
            (grupo) => `
                <div class="grupo-navegacion">
                    <span class="titulo-grupo" title="${grupo.titulo}">${iconosGrupo[grupo.titulo] || grupo.titulo}</span>
                    ${grupo.secciones
                        .map(
                            (seccion) =>
                                `<button type="button" class="${estado.seccionActiva === seccion.id ? "activa" : ""}" data-seccion="${seccion.id}">${seccion.etiqueta}</button>`
                        )
                        .join("")}
                </div>
            `
        )
        .join("")
}

const mostrarSeccion = (idSeccion) => {
    estado.seccionActiva = idSeccion
    document.querySelectorAll("[data-seccion]").forEach((bloque) => {
        bloque.classList.toggle("hidden", bloque.dataset.seccion !== idSeccion)
    })
    construirNavegacion()
}

const actualizarInterfazGeneral = () => {
    const usuario = estado.usuario
    elementos.botonCerrarSesion.classList.toggle("hidden", !usuario)
    elementos.navegacionPanel.classList.toggle("hidden", !usuario)
    elementos.vistaAcceso.classList.toggle("hidden", Boolean(usuario))
    elementos.vistaPanel.classList.toggle("hidden", !usuario)

    if (!usuario) {
        elementos.estadoSesion.textContent = "No has iniciado sesion"
        return
    }

    elementos.estadoSesion.textContent = `${usuario.nombre} - ${obtenerTextoRol(usuario.rol)} - ${usuario.verificado ? "verificado" : "sin verificar"}`
    construirNavegacion()
    mostrarSeccion(estado.seccionActiva)
    rellenarFormularioPerfil()
}

const rellenarFormularioPerfil = () => {
    const usuario = estado.usuario
    if (!usuario || !elementos.formularioPerfil) {
        return
    }

    elementos.formularioPerfil.nombre.value = usuario.nombre || ""
    elementos.formularioPerfil.fotoPerfil.value = usuario.fotoPerfil || ""
    elementos.formularioPerfil.titular.value = usuario.titular || ""
    elementos.formularioPerfil.ubicacion.value = usuario.ubicacion || ""
    elementos.formularioPerfil.web.value = usuario.web || ""
    elementos.formularioPerfil.nombreEmpresa.value = usuario.nombreEmpresa || ""
    elementos.formularioPerfil.categorias.value = (usuario.categorias || []).join(", ")
    elementos.formularioPerfil.habilidades.value = (usuario.habilidades || []).join(", ")
    elementos.formularioPerfil.intereses.value = (usuario.intereses || []).join(", ")
    elementos.formularioPerfil.biografia.value = usuario.biografia || ""
    elementos.formularioPerfil.portafolio.value = JSON.stringify(usuario.portafolio || [], null, 2)
}

const tarjeta = (contenido) => `<article class="tarjeta">${contenido}</article>`

const textoInsigniaVerificada = "Certificada por Talentea"

const poblarDestinatariosValoracion = (idProyecto, idDestinatarioPreseleccionado = "") => {
    const proyectoSeleccionado = opcionesValoracion.find((opcion) => opcion.id === idProyecto)
    const destinatarios = proyectoSeleccionado?.destinatarios || []
    const idFijado = estado.valoracionFijada.idDestinatario || idDestinatarioPreseleccionado
    const destinatariosVisibles = estado.valoracionFijada.bloqueada
        ? destinatarios.filter((destinatario) => destinatario.id === idFijado)
        : destinatarios

    elementos.selectorDestinatarioValoracion.innerHTML = `
        <option value="">Selecciona una persona</option>
        ${destinatariosVisibles
            .map(
                (destinatario) =>
                    `<option value="${destinatario.id}" ${
                        (idFijado || idDestinatarioPreseleccionado) === destinatario.id ? "selected" : ""
                    }>${destinatario.nombre} - ${destinatario.rol}</option>`
            )
            .join("")}
    `

    elementos.selectorDestinatarioValoracion.disabled = estado.valoracionFijada.bloqueada
}

const cargarOpcionesValoracion = async (idProyectoPreseleccionado = "", idDestinatarioPreseleccionado = "") => {
    if (!estado.usuario) {
        return
    }

    const datos = await llamarApi("/api/valoraciones/opciones")
    const idDestinatarioActivo = estado.valoracionFijada.idDestinatario || idDestinatarioPreseleccionado
    opcionesValoracion = (datos.elementos || []).filter((opcion) => {
        if (!idDestinatarioActivo) {
            return true
        }

        return opcion.destinatarios.some((destinatario) => destinatario.id === idDestinatarioActivo)
    })

    const proyectoInicial =
        idProyectoPreseleccionado ||
        opcionesValoracion.find((opcion) =>
            idDestinatarioActivo ? opcion.destinatarios.some((destinatario) => destinatario.id === idDestinatarioActivo) : true
        )?.id ||
        ""

    elementos.selectorProyectoValoracion.innerHTML = `
        <option value="">Selecciona un proyecto</option>
        ${opcionesValoracion
            .map(
                (opcion) =>
                    `<option value="${opcion.id}" ${
                        proyectoInicial === opcion.id ? "selected" : ""
                    }>${opcion.titulo} - ${opcion.categoria}</option>`
            )
            .join("")}
    `

    const proyectoActivo = proyectoInicial || elementos.selectorProyectoValoracion.value
    poblarDestinatariosValoracion(proyectoActivo, idDestinatarioActivo)
}

const abrirSeccionValoraciones = async (idProyecto = "", idDestinatario = "") => {
    estado.valoracionFijada = {
        idDestinatario: idDestinatario || "",
        bloqueada: Boolean(idDestinatario)
    }
    await cargarOpcionesValoracion(idProyecto, idDestinatario)
    mostrarSeccion("valoraciones")
    elementos.modalProyecto.classList.add("hidden")
    elementos.modalPerfil.classList.add("hidden")
}

const abrirPerfil = async (idUsuario, contextoProyecto = "") => {
    const [datosPerfil, datosValoraciones] = await Promise.all([
        llamarApi(`/api/usuarios/${idUsuario}`),
        llamarApi(`/api/valoraciones/usuario/${idUsuario}`)
    ])

    const usuario = datosPerfil.usuario
    const valoraciones = datosValoraciones.elementos || []

    elementos.detallePerfil.innerHTML = `
        <div class="encabezado-detalle">
            ${renderizarAvatar(usuario, usuario.nombre)}
            <div>
                <h2>${usuario.nombre}</h2>
                <p class="meta">${usuario.titular || "Sin titular"} - ${obtenerTextoRol(usuario.rol)}</p>
                ${usuario.verificado ? `<span class="insignia-verificada">${textoInsigniaVerificada}</span>` : ""}
            </div>
        </div>
        <p class="top-gap">${usuario.biografia || "Sin biografia todavia."}</p>
        <div>${(usuario.categorias || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div>${(usuario.habilidades || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div class="acciones top-gap">
            <button type="button" class="boton-secundario" data-accion="abrir-valoracion" data-id-usuario="${usuario._id}" data-id-proyecto="${contextoProyecto}">&#9733; Valorar a esta persona</button>
        </div>
        <div class="top-gap">
            <h3>Valoraciones</h3>
            <div class="detalle-valoraciones">
                ${
                    valoraciones.length
                        ? valoraciones
                              .map(
                                  (valoracion) => `
                                    <div class="tarjeta">
                                        <p><strong>${valoracion.puntuacion}/5</strong> - ${valoracion.proyecto?.titulo || "Proyecto"}</p>
                                        <p class="meta">Por ${valoracion.autor?.nombre || "Usuario"}</p>
                                        <p>${valoracion.comentario || "Sin comentario."}</p>
                                    </div>
                                  `
                              )
                              .join("")
                        : "<p class='meta'>Todavia no hay valoraciones visibles.</p>"
                }
            </div>
        </div>
    `

    elementos.modalPerfil.classList.remove("hidden")
}

const abrirProyecto = async (idProyecto) => {
    const datos = await llamarApi(`/api/proyectos/${idProyecto}`)
    const proyecto = datos.proyecto
    const puedePostularse = esRolUsuario(estado.usuario) && proyecto.estado === "abierto"
    const puedeValorarEmpresa = Boolean(estado.usuario && esRolUsuario(estado.usuario) && proyecto.estado === "completado")

    elementos.detalleProyecto.innerHTML = `
        <div class="cabecera-perfil">
            ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
            <div>
                <h2>${proyecto.titulo}</h2>
                <p class="meta">${proyecto.categoria} - ${proyecto.remoto ? "Remoto" : proyecto.ubicacion || "Presencial"}</p>
                ${proyecto.empresa?.verificado ? `<span class="insignia-verificada">${textoInsigniaVerificada}</span>` : ""}
            </div>
        </div>
        <p class="top-gap">${proyecto.descripcion}</p>
        <p class="meta">Salario: ${proyecto.salario || 0} EUR / ${proyecto.frecuenciaSalario || "mes"}</p>
        <div>${(proyecto.palabrasClave || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        <div class="tarjeta top-gap">
            <div class="empresa-detalle">
                ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                <div>
                    <h3>${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Empresa"}</h3>
                    <p class="meta">${proyecto.empresa?.titular || "Empresa en Talentea"}</p>
                    ${proyecto.empresa?.verificado ? `<span class="insignia-verificada">${textoInsigniaVerificada}</span>` : ""}
                </div>
            </div>
            <p class="top-gap">${proyecto.empresa?.biografia || "Sin descripcion de empresa por ahora."}</p>
            <p class="meta">Ubicacion: ${proyecto.empresa?.ubicacion || "No especificada"}</p>
            <p class="meta">Web: ${proyecto.empresa?.web || "No especificada"}</p>
            <div class="acciones">
                <button type="button" class="boton-secundario" data-accion="ver-perfil" data-id-usuario="${proyecto.empresa?._id}" data-id-proyecto="${proyecto._id}">Ver perfil de empresa</button>
                ${puedeValorarEmpresa ? `<button type="button" class="boton-estrella" data-accion="abrir-valoracion" data-id-usuario="${proyecto.empresa?._id}" data-id-proyecto="${proyecto._id}">&#9733; Valorar empresa</button>` : ""}
            </div>
        </div>
        ${puedePostularse ? `<div class="acciones top-gap"><button type="button" data-accion="postularse" data-id="${proyecto._id}">Postularme a este proyecto</button></div>` : ""}
    `

    elementos.modalProyecto.classList.remove("hidden")
}

const pintarProyectos = (proyectos = []) => {
    elementos.listaProyectos.innerHTML =
        proyectos.length === 0
            ? tarjeta("<p class='meta'>No hay proyectos para los filtros actuales.</p>")
            : proyectos
                  .map((proyecto) => {
                      const puedePostularse = esRolUsuario(estado.usuario) && proyecto.estado === "abierto"
                      const puedeGestionar =
                          estado.usuario?.rol === "empresa" && estado.usuario?._id === proyecto.empresa?._id

                      return `
                      <article class="tarjeta tarjeta-clickable" data-id-proyecto="${proyecto._id}">
                        <div class="cabecera-perfil">
                            ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                            <div>
                                <h3>${proyecto.titulo}</h3>
                                <p class="meta">${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Sin nombre"}</p>
                                ${proyecto.empresa?.verificado ? '<span class="insignia-verificada">✓ Certificada por Talentea</span>' : ""}
                            </div>
                        </div>
                        <p class="meta">${proyecto.categoria} - ${proyecto.remoto ? "Remoto" : proyecto.ubicacion || "Presencial"} - Estado: ${proyecto.estado}</p>
                        <p>${proyecto.descripcion}</p>
                        <p class="meta">Empresa: ${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Sin nombre"} - Salario: ${proyecto.salario || 0} EUR / ${proyecto.frecuenciaSalario || "mes"}</p>
                        <div>${(proyecto.palabrasClave || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                        <div class="acciones">
                            <button type="button" class="boton-secundario" data-accion="ver-proyecto" data-id="${proyecto._id}">Ver detalle</button>
                            ${puedePostularse ? `<button type="button" data-accion="postularse" data-id="${proyecto._id}">Postularme</button>` : ""}
                            ${puedeGestionar ? `<button type="button" class="boton-secundario" data-accion="completar-proyecto" data-id="${proyecto._id}">Marcar completado</button>` : ""}
                        </div>
                      </article>
                      `
                  })
                  .join("")
}

const pintarCreativos = (creativos = []) => {
    elementos.listaCreativos.innerHTML =
        creativos.length === 0
            ? tarjeta("<p class='meta'>No hay perfiles para esos filtros.</p>")
            : creativos
                  .map((creativo) => `
                      <article class="tarjeta tarjeta-clickable" data-id-usuario="${creativo._id}">
                        <div class="cabecera-perfil">
                            ${renderizarAvatar(creativo, creativo.nombre)}
                            <div>
                                <h3>${creativo.nombre}</h3>
                                ${creativo.verificado ? `<span class="insignia-verificada">${textoInsigniaVerificada}</span>` : ""}
                            </div>
                        </div>
                        <p class="meta">${creativo.titular || "Sin titular"} - ${creativo.verificado ? "Verificado" : "Pendiente"} - Rating ${creativo.valoracionMedia || 0} (${creativo.totalValoraciones || 0})</p>
                        <p>${creativo.biografia || "Sin biografia todavia."}</p>
                        <div>${(creativo.categorias || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                        <div>${(creativo.habilidades || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                        <div class="acciones">
                            <button type="button" class="boton-secundario" data-accion="ver-perfil" data-id-usuario="${creativo._id}">Ver perfil</button>
                            <button type="button" class="boton-estrella" data-accion="abrir-valoracion" data-id-usuario="${creativo._id}">&#9733; Valorar</button>
                        </div>
                      </article>
                  `)
                  .join("")
}

const pintarMisCandidaturas = (candidaturas = []) => {
    elementos.listaMisCandidaturas.innerHTML =
        candidaturas.length === 0
            ? tarjeta("<p class='meta'>Todavia no has enviado candidaturas.</p>")
            : candidaturas
                  .map((candidatura) =>
                      tarjeta(`
                        <h3>${candidatura.proyecto?.titulo || "Proyecto eliminado"}</h3>
                        <p class="meta">Estado: ${candidatura.estado} - Empresa: ${candidatura.proyecto?.empresa?.nombreEmpresa || candidatura.proyecto?.empresa?.nombre || "Sin nombre"}</p>
                        <p>${candidatura.cartaPresentacion || "Sin carta de presentacion."}</p>
                        <p class="meta">Historial: ${(candidatura.historialEstados || []).map((item) => item.estado).join(" -> ")}</p>
                      `)
                  )
                  .join("")
}

const pintarGestionEmpresa = async (proyectos = []) => {
    if (proyectos.length === 0) {
        elementos.listaProyectosEmpresa.innerHTML = tarjeta("<p class='meta'>Todavia no has publicado proyectos.</p>")
        return
    }

    const bloques = await Promise.all(
        proyectos.map(async (proyecto) => {
            const datos = await llamarApi(`/api/candidaturas/proyecto/${proyecto._id}`)
            const candidaturas = datos.elementos.length
                ? datos.elementos
                      .map(
                          (candidatura) => `
                            <div class="tarjeta top-gap">
                                <h3>${candidatura.creativo?.nombre || "Usuario"}</h3>
                                <p class="meta">${candidatura.creativo?.titular || "Sin titular"} - Estado: ${candidatura.estado}</p>
                                <p>${candidatura.cartaPresentacion || "Sin mensaje"}</p>
                                <div class="acciones">
                                    <button type="button" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="en revision">En revision</button>
                                    <button type="button" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="aceptada">Aceptar</button>
                                    <button type="button" class="boton-secundario" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="rechazada">Rechazar</button>
                                </div>
                            </div>
                          `
                      )
                      .join("")
                : "<p class='meta'>Sin candidaturas todavia.</p>"

            return tarjeta(`
                <h3>${proyecto.titulo}</h3>
                <p class="meta">${proyecto.categoria} - Estado ${proyecto.estado}</p>
                <p>${proyecto.descripcion}</p>
                <div class="acciones">
                    <button type="button" class="boton-secundario" data-accion="completar-proyecto" data-id="${proyecto._id}">Marcar completado</button>
                </div>
                ${candidaturas}
            `)
        })
    )

    elementos.listaProyectosEmpresa.innerHTML = bloques.join("")
}

const pintarAdministracion = async () => {
    const [panel, usuarios, auditoria] = await Promise.all([
        llamarApi("/api/administracion/panel"),
        llamarApi("/api/administracion/usuarios"),
        llamarApi("/api/administracion/auditoria")
    ])

    elementos.metricasAdministracion.innerHTML = Object.entries(panel.metricas)
        .map(
            ([clave, valor]) => `
                <div>
                    <span class="meta">${clave}</span>
                    <h3>${valor}</h3>
                </div>
            `
        )
        .join("")

    elementos.listaUsuariosAdmin.innerHTML = usuarios.elementos
        .map((usuario) =>
            tarjeta(`
                <h3>${usuario.nombre}</h3>
                <p class="meta">${usuario.rol} - ${usuario.email} - ${usuario.verificado ? "Verificado" : "Pendiente"}</p>
                <div class="acciones">
                    <button type="button" data-accion="verificar" data-id="${usuario._id}" data-valor="true">Verificar</button>
                    <button type="button" class="boton-secundario" data-accion="verificar" data-id="${usuario._id}" data-valor="false">Quitar verificacion</button>
                </div>
            `)
        )
        .join("")

    elementos.listaAuditoria.innerHTML = auditoria.elementos
        .map((registro) =>
            tarjeta(`
                <h3>${registro.accion}</h3>
                <p class="meta">${new Date(registro.createdAt).toLocaleString()} - ${registro.tipoEntidad} - ${registro.actor?.nombre || "Sistema"}</p>
            `)
        )
        .join("")
}

const cargarProyectos = async () => {
    const parametros = new URLSearchParams()
    if (elementos.busquedaProyecto.value.trim()) parametros.set("palabraClave", elementos.busquedaProyecto.value.trim())
    if (elementos.categoriaProyecto.value.trim()) parametros.set("categoria", elementos.categoriaProyecto.value.trim())
    const datos = await llamarApi(`/api/proyectos?${parametros.toString()}`)
    pintarProyectos(datos.elementos)
}

const cargarCreativos = async () => {
    const parametros = new URLSearchParams()
    if (elementos.busquedaCreativo.value.trim()) parametros.set("palabraClave", elementos.busquedaCreativo.value.trim())
    if (elementos.categoriaCreativo.value.trim()) parametros.set("categoria", elementos.categoriaCreativo.value.trim())
    const datos = await llamarApi(`/api/usuarios?${parametros.toString()}`)
    pintarCreativos(datos.elementos)
}

const cargarVistasPrivadas = async () => {
    if (!estado.usuario) {
        return
    }

    if (esRolUsuario(estado.usuario)) {
        const datos = await llamarApi("/api/candidaturas/mias")
        pintarMisCandidaturas(datos.elementos)
    }

    if (estado.usuario.rol === "empresa") {
        const datos = await llamarApi(`/api/proyectos?idEmpresa=${estado.usuario._id}`)
        await pintarGestionEmpresa(datos.elementos)
    }

    if (estado.usuario.rol === "admin") {
        await pintarAdministracion()
    }

    await cargarOpcionesValoracion()
}

const refrescarUsuarioActual = async () => {
    if (!estado.token) {
        return
    }

    const datos = await llamarApi("/api/autenticacion/mi-perfil")
    guardarSesion({ token: estado.token, usuario: datos.usuario })
}

const mostrarFormularioAcceso = (tipo) => {
    const esLogin = tipo === "login"
    elementos.formularioLogin.classList.toggle("hidden", !esLogin)
    elementos.formularioRegistro.classList.toggle("hidden", esLogin)
    elementos.mostrarLogin.classList.toggle("activa", esLogin)
    elementos.mostrarRegistro.classList.toggle("activa", !esLogin)
}

elementos.botonTema.addEventListener("click", cambiarTema)
elementos.mostrarLogin.addEventListener("click", () => mostrarFormularioAcceso("login"))
elementos.mostrarRegistro.addEventListener("click", () => mostrarFormularioAcceso("registro"))
elementos.botonCerrarSesion.addEventListener("click", async () => {
    guardarSesion(null)
    estado.seccionActiva = "inicio"
    mostrarFormularioAcceso("login")
    mostrarAviso("Sesion cerrada")
})

elementos.navegacionPanel.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-seccion]")
    if (!boton) {
        return
    }

    if (boton.dataset.seccion === "valoraciones") {
        estado.valoracionFijada = { idDestinatario: "", bloqueada: false }
        elementos.selectorDestinatarioValoracion.disabled = false
        cargarOpcionesValoracion().catch((error) => mostrarAviso(error.message, true))
    }

    mostrarSeccion(boton.dataset.seccion)
})

elementos.formularioRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        const datosFormulario = new FormData(evento.currentTarget)
        const cuerpo = Object.fromEntries(datosFormulario.entries())
        const datos = await llamarApi("/api/autenticacion/registro", {
            method: "POST",
            body: JSON.stringify(cuerpo)
        })
        guardarSesion(datos)
        mostrarAviso("Cuenta creada correctamente")
        await Promise.all([cargarProyectos(), cargarCreativos(), cargarVistasPrivadas()])
    } catch (error) {
        mostrarAviso(error.message, true)
    }
})

elementos.formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        const datosFormulario = new FormData(evento.currentTarget)
        const cuerpo = Object.fromEntries(datosFormulario.entries())
        const datos = await llamarApi("/api/autenticacion/login", {
            method: "POST",
            body: JSON.stringify(cuerpo)
        })
        guardarSesion(datos)
        mostrarAviso("Sesion iniciada")
        await Promise.all([cargarProyectos(), cargarCreativos(), cargarVistasPrivadas()])
    } catch (error) {
        mostrarAviso(error.message, true)
    }
})

elementos.formularioPerfil.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        const datosFormulario = new FormData(evento.currentTarget)
        const cuerpo = Object.fromEntries(datosFormulario.entries())
        cuerpo.portafolio = cuerpo.portafolio ? JSON.parse(cuerpo.portafolio) : []
        const datos = await llamarApi("/api/usuarios/mi-perfil", {
            method: "PUT",
            body: JSON.stringify(cuerpo)
        })
        guardarSesion({ token: estado.token, usuario: datos.usuario })
        mostrarAviso("Perfil actualizado")
        await cargarCreativos()
    } catch (error) {
        mostrarAviso(error.message, true)
    }
})

elementos.formularioProyecto.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    if (estado.enviandoProyecto) {
        return
    }

    try {
        estado.enviandoProyecto = true
        const formulario = evento.currentTarget
        const datosFormulario = new FormData(formulario)
        const cuerpo = Object.fromEntries(datosFormulario.entries())
        cuerpo.remoto = datosFormulario.get("remoto") === "on"
        cuerpo.salario = Number(cuerpo.salario || 0)
        await llamarApi("/api/proyectos", {
            method: "POST",
            body: JSON.stringify(cuerpo)
        })
        if (formulario && typeof formulario.reset === "function") {
            formulario.reset()
        }
        mostrarAviso("Proyecto publicado")
        estado.seccionActiva = "gestion-empresa"
        mostrarSeccion("gestion-empresa")
        await Promise.all([cargarProyectos(), cargarVistasPrivadas()])
    } catch (error) {
        mostrarAviso(error.message, true)
    } finally {
        estado.enviandoProyecto = false
    }
})

elementos.formularioValoracion.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    try {
        const datosFormulario = new FormData(evento.currentTarget)
        const cuerpo = Object.fromEntries(datosFormulario.entries())
        cuerpo.puntuacion = Number(cuerpo.puntuacion)
        await llamarApi("/api/valoraciones", {
            method: "POST",
            body: JSON.stringify(cuerpo)
        })
        evento.currentTarget.reset()
        estado.valoracionFijada = { idDestinatario: "", bloqueada: false }
        elementos.selectorDestinatarioValoracion.disabled = false
        poblarDestinatariosValoracion("")
        mostrarAviso("Valoracion enviada")
        await Promise.all([cargarCreativos(), cargarOpcionesValoracion()])
    } catch (error) {
        mostrarAviso(error.message, true)
    }
})

elementos.botonActualizarProyectos.addEventListener("click", cargarProyectos)
elementos.botonActualizarCreativos.addEventListener("click", cargarCreativos)
elementos.busquedaProyecto.addEventListener("input", cargarProyectos)
elementos.categoriaProyecto.addEventListener("input", cargarProyectos)
elementos.busquedaCreativo.addEventListener("input", cargarCreativos)
elementos.categoriaCreativo.addEventListener("input", cargarCreativos)
elementos.selectorProyectoValoracion.addEventListener("change", (evento) => {
    poblarDestinatariosValoracion(evento.target.value)
})

document.addEventListener(
    "click",
    async (evento) => {
        const tarjetaProyecto = evento.target.closest("[data-id-proyecto]")
        if (tarjetaProyecto && !evento.target.closest("button")) {
            evento.preventDefault()
            evento.stopImmediatePropagation()
            try {
                await abrirProyecto(tarjetaProyecto.dataset.idProyecto)
            } catch (error) {
                mostrarAviso(error.message, true)
            }
            return
        }

        const tarjetaUsuario = evento.target.closest("[data-id-usuario]")
        if (tarjetaUsuario && !evento.target.closest("button")) {
            evento.preventDefault()
            evento.stopImmediatePropagation()
            try {
                await abrirPerfil(tarjetaUsuario.dataset.idUsuario)
            } catch (error) {
                mostrarAviso(error.message, true)
            }
            return
        }

        const boton = evento.target.closest("button[data-accion]")
        if (!boton) {
            return
        }

        if (boton.dataset.accion === "ver-proyecto") {
            evento.preventDefault()
            evento.stopImmediatePropagation()
            try {
                await abrirProyecto(boton.dataset.id)
            } catch (error) {
                mostrarAviso(error.message, true)
            }
        }

        if (boton.dataset.accion === "ver-perfil") {
            evento.preventDefault()
            evento.stopImmediatePropagation()
            try {
                await abrirPerfil(boton.dataset.idUsuario, boton.dataset.idProyecto || "")
            } catch (error) {
                mostrarAviso(error.message, true)
            }
        }

        if (boton.dataset.accion === "abrir-valoracion") {
            evento.preventDefault()
            evento.stopImmediatePropagation()
            try {
                await abrirSeccionValoraciones(boton.dataset.idProyecto || "", boton.dataset.idUsuario || "")
                mostrarAviso("Selecciona proyecto y persona para valorar")
            } catch (error) {
                mostrarAviso(error.message, true)
            }
        }
    },
    true
)

document.addEventListener("click", async (evento) => {
    const tarjetaProyecto = evento.target.closest("[data-id-proyecto]")
    if (tarjetaProyecto && !evento.target.closest("button")) {
        const idProyecto = tarjetaProyecto.dataset.idProyecto
        const datos = await llamarApi(`/api/proyectos/${idProyecto}`)
        const proyecto = datos.proyecto
        const puedePostularse = esRolUsuario(estado.usuario) && proyecto.estado === "abierto"

        elementos.detalleProyecto.innerHTML = `
            <div class="cabecera-perfil">
                ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                <div>
                    <h2>${proyecto.titulo}</h2>
                    <p class="meta">${proyecto.categoria} - ${proyecto.remoto ? "Remoto" : proyecto.ubicacion || "Presencial"}</p>
                    ${proyecto.empresa?.verificado ? '<span class="insignia-verificada">✓ Empresa certificada por Talentea</span>' : ""}
                </div>
            </div>
            <p class="top-gap">${proyecto.descripcion}</p>
            <p class="meta">Salario: ${proyecto.salario || 0} EUR / ${proyecto.frecuenciaSalario || "mes"}</p>
            <div>${(proyecto.palabrasClave || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
            <div class="tarjeta top-gap">
                <div class="empresa-detalle">
                    ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                    <div>
                        <h3>${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Empresa"}</h3>
                        <p class="meta">${proyecto.empresa?.titular || "Empresa en Talentea"}</p>
                    </div>
                </div>
                <p class="top-gap">${proyecto.empresa?.biografia || "Sin descripcion de empresa por ahora."}</p>
                <p class="meta">Ubicacion: ${proyecto.empresa?.ubicacion || "No especificada"}</p>
                <p class="meta">Web: ${proyecto.empresa?.web || "No especificada"}</p>
            </div>
            ${puedePostularse ? `<div class="acciones top-gap"><button type="button" data-accion="postularse" data-id="${proyecto._id}">Postularme a este proyecto</button></div>` : ""}
        `
        elementos.modalProyecto.classList.remove("hidden")
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

            await llamarApi("/api/candidaturas", {
                method: "POST",
                body: JSON.stringify({
                    idProyecto: id,
                    cartaPresentacion,
                    enlacesPortafolio: (estado.usuario?.portafolio || [])
                        .map((item) => item.urlProyecto || item.urlMedia)
                        .filter(Boolean)
                })
            })
            mostrarAviso("Candidatura enviada")
        }

        if (accion === "ver-proyecto") {
            const datos = await llamarApi(`/api/proyectos/${id}`)
            const proyecto = datos.proyecto
            const puedePostularse = esRolUsuario(estado.usuario) && proyecto.estado === "abierto"

            elementos.detalleProyecto.innerHTML = `
                <div class="cabecera-perfil">
                    ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                    <div>
                        <h2>${proyecto.titulo}</h2>
                        <p class="meta">${proyecto.categoria} - ${proyecto.remoto ? "Remoto" : proyecto.ubicacion || "Presencial"}</p>
                        ${proyecto.empresa?.verificado ? '<span class="insignia-verificada">✓ Empresa certificada por Talentea</span>' : ""}
                    </div>
                </div>
                <p class="top-gap">${proyecto.descripcion}</p>
                <p class="meta">Salario: ${proyecto.salario || 0} EUR / ${proyecto.frecuenciaSalario || "mes"}</p>
                <div>${(proyecto.palabrasClave || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                <div class="tarjeta top-gap">
                    <div class="empresa-detalle">
                        ${renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                        <div>
                            <h3>${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Empresa"}</h3>
                            <p class="meta">${proyecto.empresa?.titular || "Empresa en Talentea"}</p>
                        </div>
                    </div>
                    <p class="top-gap">${proyecto.empresa?.biografia || "Sin descripcion de empresa por ahora."}</p>
                    <p class="meta">Ubicacion: ${proyecto.empresa?.ubicacion || "No especificada"}</p>
                    <p class="meta">Web: ${proyecto.empresa?.web || "No especificada"}</p>
                </div>
                ${puedePostularse ? `<div class="acciones top-gap"><button type="button" data-accion="postularse" data-id="${proyecto._id}">Postularme a este proyecto</button></div>` : ""}
            `
            elementos.modalProyecto.classList.remove("hidden")
        }

        if (accion === "cambiar-estado") {
            await llamarApi(`/api/candidaturas/${id}/estado`, {
                method: "PATCH",
                body: JSON.stringify({ estado: nuevoEstado })
            })
            mostrarAviso("Estado actualizado")
        }

        if (accion === "completar-proyecto") {
            await llamarApi(`/api/proyectos/${id}`, {
                method: "PUT",
                body: JSON.stringify({ estado: "completado" })
            })
            mostrarAviso("Proyecto marcado como completado")
        }

        if (accion === "verificar") {
            await llamarApi(`/api/administracion/usuarios/${id}/verificacion`, {
                method: "PATCH",
                body: JSON.stringify({ verificado: valor === "true" })
            })
            mostrarAviso("Verificacion actualizada")
        }

        await Promise.all([cargarProyectos(), cargarCreativos(), cargarVistasPrivadas()])
    } catch (error) {
        mostrarAviso(error.message, true)
    }
})

const iniciarAplicacion = async () => {
    aplicarTema()
    mostrarFormularioAcceso("login")

    try {
        if (estado.token) {
            await refrescarUsuarioActual()
            await Promise.all([cargarProyectos(), cargarCreativos(), cargarVistasPrivadas()])
        } else {
            actualizarInterfazGeneral()
        }
    } catch (error) {
        guardarSesion(null)
        mostrarAviso("La sesion habia expirado", true)
    }
}

elementos.cerrarModalProyecto.addEventListener("click", () => {
    elementos.modalProyecto.classList.add("hidden")
})

elementos.modalProyecto.addEventListener("click", (evento) => {
    if (evento.target.dataset.cerrarModal === "true") {
        elementos.modalProyecto.classList.add("hidden")
    }
})

elementos.cerrarModalPerfil.addEventListener("click", () => {
    elementos.modalPerfil.classList.add("hidden")
})

elementos.modalPerfil.addEventListener("click", (evento) => {
    if (evento.target.dataset.cerrarModalPerfil === "true") {
        elementos.modalPerfil.classList.add("hidden")
    }
})

iniciarAplicacion()
