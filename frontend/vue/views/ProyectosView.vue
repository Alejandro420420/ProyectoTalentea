<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Mercado</p>
                <h1>Proyectos disponibles</h1>
            </div>
            <button class="boton-secundario" type="button" @click="cargarProyectos">Actualizar</button>
        </div>

        <div class="panel seccion-panel md-card">
            <div class="filtros">
                <div class="form-group">
                    <label>Busqueda</label>
                    <input v-model="app.filtros.busquedaProyecto" placeholder="Buscar por palabra clave" @input="cargarProyectos" />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <input v-model="app.filtros.categoriaProyecto" placeholder="Filtrar por categoria" @input="cargarProyectos" />
                </div>
            </div>
        </div>

        <div class="lista-tarjetas top-gap">
            <article v-for="proyecto in app.proyectos" :key="proyecto._id" class="tarjeta tarjeta-clickable tarjeta-proyecto md-card" @click="app.abrirProyecto(proyecto._id)">
                <button v-if="app.usuario?.rol === 'empresa' && app.usuario?._id === proyecto.empresa?._id" type="button" class="boton-eliminar-proyecto" @click.stop="eliminarProyecto(proyecto._id)">X</button>
                <div class="cabecera-perfil">
                    <div v-html="app.renderizarAvatarHtml(proyecto.empresa, proyecto.empresa?.nombreEmpresa)"></div>
                    <div>
                        <h3>{{ proyecto.titulo }}</h3>
                        <p class="meta nombre-verificado">
                            <span>{{ proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || 'Sin nombre' }}</span>
                            <span v-if="proyecto.empresa?.verificado" class="tick-verificado" title="Empresa verificada" aria-label="Empresa verificada">&#10003;</span>
                        </p>
                    </div>
                </div>
                <p class="meta">{{ proyecto.categoria }} - {{ proyecto.remoto ? 'Remoto' : (proyecto.ubicacion || 'Presencial') }} - Estado: {{ proyecto.estado }}</p>
                <p>{{ proyecto.descripcion }}</p>
                <p class="meta">Salario: {{ proyecto.salario || 0 }} EUR / {{ proyecto.frecuenciaSalario || 'mes' }}</p>
                <div class="acciones">
                    <button type="button" class="boton-secundario" @click.stop="app.abrirProyecto(proyecto._id)">Ver detalle</button>
                    <button v-if="app.esRolUsuario(app.usuario) && proyecto.estado === 'abierto'" type="button" @click.stop="app.abrirModalCandidatura(proyecto._id)">Postularme</button>
                    <button v-if="app.usuario?.rol === 'empresa' && app.usuario?._id === proyecto.empresa?._id" type="button" class="boton-secundario" @click.stop="completarProyecto(proyecto._id)">Marcar completado</button>
                </div>
            </article>
            <article v-if="!app.proyectos.length" class="tarjeta md-card"><p class="meta">No hay proyectos para los filtros actuales.</p></article>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    },
    methods: {
        async cargarProyectos() {
            const parametros = new URLSearchParams()
            if (this.app.filtros.busquedaProyecto.trim()) parametros.set("palabraClave", this.app.filtros.busquedaProyecto.trim())
            if (this.app.filtros.categoriaProyecto.trim()) parametros.set("categoria", this.app.filtros.categoriaProyecto.trim())
            const datos = await this.app.llamarApi(`/api/proyectos?${parametros.toString()}`)
            this.app.proyectos = datos.elementos || []
        },
        async completarProyecto(id) {
            await this.app.llamarApi(`/api/proyectos/${id}`, {
                method: "PUT",
                body: JSON.stringify({ estado: "completado" })
            })
            this.app.mostrarAviso("Proyecto marcado como completado")
            await Promise.all([this.cargarProyectos(), this.app.cargarVistasPrivadas()])
        },
        async eliminarProyecto(id) {
            if (!window.confirm("Quieres eliminar este proyecto? Esta accion no se puede deshacer.")) return
            await this.app.llamarApi(`/api/proyectos/${id}`, { method: "DELETE" })
            this.app.mostrarAviso("Proyecto eliminado")
            this.app.modalProyecto = null
            await Promise.all([this.cargarProyectos(), this.app.cargarVistasPrivadas()])
        }
    }
}
</script>
