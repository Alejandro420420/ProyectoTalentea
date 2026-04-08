(() => {
const App = window.Talentea

App.pintarProyectos = (proyectos = []) => {
    App.elementos.listaProyectos.innerHTML =
        proyectos.length === 0
            ? App.tarjeta("<p class='meta'>No hay proyectos para los filtros actuales.</p>")
            : proyectos
                  .map((proyecto) => {
                      const puedePostularse = App.esRolUsuario(App.estado.usuario) && proyecto.estado === "abierto"
                      const puedeGestionar = App.estado.usuario?.rol === "empresa" && App.estado.usuario?._id === proyecto.empresa?._id

                      return `
                        <article class="tarjeta tarjeta-clickable tarjeta-proyecto" data-id-proyecto="${proyecto._id}">
                            ${puedeGestionar ? `<button type="button" class="boton-eliminar-proyecto" data-accion="eliminar-proyecto" data-id="${proyecto._id}" aria-label="Eliminar proyecto" title="Eliminar proyecto">&#128465;</button>` : ""}
                            <div class="cabecera-perfil">
                                ${App.renderizarAvatar(proyecto.empresa, proyecto.empresa?.nombreEmpresa)}
                                <div>
                                    <h3>${proyecto.titulo}</h3>
                                    <p class="meta">${proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || "Sin nombre"}</p>
                                    ${proyecto.empresa?.verificado ? `<span class="insignia-verificada">${App.textoInsigniaVerificada}</span>` : ""}
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

App.pintarTalento = (usuarios = []) => {
    App.elementos.listaCreativos.innerHTML =
        usuarios.length === 0
            ? App.tarjeta("<p class='meta'>No hay perfiles para esos filtros.</p>")
            : usuarios
                  .map(
                      (usuario) => `
                        <article class="tarjeta tarjeta-clickable" data-id-usuario="${usuario._id}">
                            <div class="cabecera-perfil">
                                ${App.renderizarAvatar(usuario, usuario.nombre)}
                                <div>
                                    <h3>${usuario.nombre}</h3>
                                    ${usuario.verificado ? `<span class="insignia-verificada">${App.textoInsigniaVerificada}</span>` : ""}
                                </div>
                            </div>
                            <p class="meta">${usuario.titular || "Sin titular"} - ${usuario.verificado ? "Verificado" : "Pendiente"} - Rating ${usuario.valoracionMedia || 0} (${usuario.totalValoraciones || 0})</p>
                            <p>${usuario.biografia || "Sin biografia todavia."}</p>
                            <div>${(usuario.categorias || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                            <div>${(usuario.habilidades || []).map((item) => `<span class="pill">${item}</span>`).join("")}</div>
                            <div class="acciones">
                                <button type="button" class="boton-secundario" data-accion="ver-perfil" data-id-usuario="${usuario._id}">Ver perfil</button>
                                <button type="button" class="boton-estrella" data-accion="abrir-valoracion" data-id-usuario="${usuario._id}">&#9733; Valorar</button>
                            </div>
                        </article>
                      `
                  )
                  .join("")
}

App.pintarMisCandidaturas = (candidaturas = []) => {
    App.elementos.listaMisCandidaturas.innerHTML =
        candidaturas.length === 0
            ? App.tarjeta("<p class='meta'>Todavia no has enviado candidaturas.</p>")
            : candidaturas
                  .map(
                      (candidatura) => `
                        <article class="tarjeta">
                            <h3>${candidatura.proyecto?.titulo || "Proyecto eliminado"}</h3>
                            <p class="meta">Estado: ${candidatura.estado} - Empresa: ${candidatura.proyecto?.empresa?.nombreEmpresa || candidatura.proyecto?.empresa?.nombre || "Sin nombre"}</p>
                            <p>${candidatura.cartaPresentacion || "Sin carta de presentacion."}</p>
                            <p class="meta">Historial: ${(candidatura.historialEstados || []).map((item) => item.estado).join(" -> ")}</p>
                        </article>
                      `
                  )
                  .join("")
}

App.pintarGestionEmpresa = async (proyectos = []) => {
    if (proyectos.length === 0) {
        App.elementos.listaProyectosEmpresa.innerHTML = App.tarjeta("<p class='meta'>Todavia no has publicado proyectos.</p>")
        return
    }

    const bloques = await Promise.all(
        proyectos.map(async (proyecto) => {
            const datos = await App.llamarApi(`/api/candidaturas/proyecto/${proyecto._id}`)
            const candidaturas = datos.elementos.length
                ? datos.elementos
                      .map(
                          (candidatura) => `
                            <div class="tarjeta tarjeta-clickable top-gap" ${candidatura.creativo?._id ? `data-id-usuario="${candidatura.creativo._id}" data-id-proyecto="${proyecto._id}"` : ""}>
                                <h3>${candidatura.creativo?.nombre || "Usuario"}</h3>
                                <p class="meta">${candidatura.creativo?.titular || "Sin titular"} - Estado: ${candidatura.estado}</p>
                                <p>${candidatura.cartaPresentacion || "Sin mensaje"}</p>
                                <div class="acciones">
                                    <button type="button" class="boton-secundario" data-accion="ver-perfil" data-id-usuario="${candidatura.creativo?._id}" data-id-proyecto="${proyecto._id}">Ver perfil</button>
                                    <button type="button" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="en revision">En revision</button>
                                    <button type="button" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="aceptada">Aceptar</button>
                                    <button type="button" class="boton-secundario" data-accion="cambiar-estado" data-id="${candidatura._id}" data-estado="rechazada">Rechazar</button>
                                    ${proyecto.estado === "completado" && candidatura.estado === "aceptada" ? `<button type="button" class="boton-estrella" data-accion="abrir-valoracion" data-id-usuario="${candidatura.creativo?._id}" data-id-proyecto="${proyecto._id}">&#9733; Valorar</button>` : ""}
                                </div>
                            </div>
                          `
                      )
                      .join("")
                : "<p class='meta'>Sin candidaturas todavia.</p>"

            return App.tarjeta(`
                <div class="cabecera-tarjeta-proyecto">
                    <h3>${proyecto.titulo}</h3>
                    <button type="button" class="boton-eliminar-proyecto" data-accion="eliminar-proyecto" data-id="${proyecto._id}" aria-label="Eliminar proyecto" title="Eliminar proyecto">&#128465;</button>
                </div>
                <p class="meta">${proyecto.categoria} - Estado ${proyecto.estado}</p>
                <p>${proyecto.descripcion}</p>
                <div class="acciones">
                    <button type="button" class="boton-secundario" data-accion="completar-proyecto" data-id="${proyecto._id}">Marcar completado</button>
                </div>
                ${candidaturas}
            `)
        })
    )

    App.elementos.listaProyectosEmpresa.innerHTML = bloques.join("")
}

App.pintarAdministracion = async () => {
    const [panel, usuarios, auditoria] = await Promise.all([
        App.llamarApi("/api/administracion/panel"),
        App.llamarApi("/api/administracion/usuarios"),
        App.llamarApi("/api/administracion/auditoria")
    ])

    App.elementos.metricasAdministracion.innerHTML = Object.entries(panel.metricas)
        .map(
            ([clave, valor]) => `
                <div>
                    <span class="meta">${clave}</span>
                    <h3>${valor}</h3>
                </div>
            `
        )
        .join("")

    App.elementos.listaUsuariosAdmin.innerHTML = usuarios.elementos
        .map(
            (usuario) =>
                App.tarjeta(`
                    <h3>${usuario.nombre}</h3>
                    <p class="meta">${usuario.rol} - ${usuario.email} - ${usuario.verificado ? "Verificado" : "Pendiente"}</p>
                    <div class="acciones">
                        <button type="button" data-accion="verificar" data-id="${usuario._id}" data-valor="true">Verificar</button>
                        <button type="button" class="boton-secundario" data-accion="verificar" data-id="${usuario._id}" data-valor="false">Quitar verificacion</button>
                    </div>
                `)
        )
        .join("")

    App.elementos.listaAuditoria.innerHTML = auditoria.elementos
        .map(
            (registro) =>
                App.tarjeta(`
                    <h3>${registro.accion}</h3>
                    <p class="meta">${new Date(registro.createdAt).toLocaleString()} - ${registro.tipoEntidad} - ${registro.actor?.nombre || "Sistema"}</p>
                `)
        )
        .join("")
}

App.cargarProyectos = async () => {
    const parametros = new URLSearchParams()
    if (App.elementos.busquedaProyecto.value.trim()) parametros.set("palabraClave", App.elementos.busquedaProyecto.value.trim())
    if (App.elementos.categoriaProyecto.value.trim()) parametros.set("categoria", App.elementos.categoriaProyecto.value.trim())
    const datos = await App.llamarApi(`/api/proyectos?${parametros.toString()}`)
    App.pintarProyectos(datos.elementos)
}

App.cargarTalento = async () => {
    const parametros = new URLSearchParams()
    if (App.elementos.busquedaCreativo.value.trim()) parametros.set("palabraClave", App.elementos.busquedaCreativo.value.trim())
    if (App.elementos.categoriaCreativo.value.trim()) parametros.set("categoria", App.elementos.categoriaCreativo.value.trim())
    const datos = await App.llamarApi(`/api/usuarios?${parametros.toString()}`)
    App.pintarTalento(datos.elementos)
}

App.cargarVistasPrivadas = async () => {
    if (!App.estado.usuario) {
        return
    }

    if (App.esRolUsuario(App.estado.usuario)) {
        const datos = await App.llamarApi("/api/candidaturas/mias")
        App.pintarMisCandidaturas(datos.elementos)
    }

    if (App.estado.usuario.rol === "empresa") {
        const datos = await App.llamarApi(`/api/proyectos?idEmpresa=${App.estado.usuario._id}`)
        await App.pintarGestionEmpresa(datos.elementos)
    }

    if (App.estado.usuario.rol === "admin") {
        await App.pintarAdministracion()
    }

    await App.cargarOpcionesValoracion()
}
})()
