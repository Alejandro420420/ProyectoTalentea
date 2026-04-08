<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Empresa</p>
                <h1>Gestionar candidaturas</h1>
            </div>
        </div>

        <div class="lista-tarjetas">
            <article v-for="proyecto in app.proyectosEmpresa" :key="proyecto._id" class="tarjeta md-card">
                <div class="cabecera-tarjeta-proyecto">
                    <div>
                        <h3>{{ proyecto.titulo }}</h3>
                        <p class="meta">{{ proyecto.categoria }} - Estado {{ proyecto.estado }}</p>
                    </div>
                    <button type="button" class="boton-eliminar-proyecto" @click="eliminarProyecto(proyecto._id)">X</button>
                </div>
                <p>{{ proyecto.descripcion }}</p>
                <div class="acciones">
                    <button type="button" class="boton-secundario" @click="completarProyecto(proyecto._id)">Marcar completado</button>
                </div>
                <div v-if="proyecto.candidaturas?.length">
                    <article v-for="candidatura in proyecto.candidaturas" :key="candidatura._id" class="tarjeta tarjeta-clickable top-gap md-card" @click="candidatura.creativo?._id && app.abrirPerfil(candidatura.creativo._id, proyecto._id)">
                        <h3>{{ candidatura.creativo?.nombre || 'Usuario' }}</h3>
                        <p class="meta">{{ candidatura.creativo?.titular || 'Sin titular' }} - Estado: {{ candidatura.estado }}</p>
                        <p>{{ candidatura.cartaPresentacion || 'Sin mensaje' }}</p>
                        <div class="acciones">
                            <button type="button" class="boton-secundario" @click.stop="candidatura.creativo?._id && app.abrirPerfil(candidatura.creativo._id, proyecto._id)">Ver perfil</button>
                            <button type="button" @click.stop="cambiarEstadoCandidatura(candidatura._id, 'en revision')">Marcar leido</button>
                            <button type="button" @click.stop="cambiarEstadoCandidatura(candidatura._id, 'aceptada')">Aceptar</button>
                            <button type="button" class="boton-secundario" @click.stop="cambiarEstadoCandidatura(candidatura._id, 'rechazada')">Rechazar</button>
                            <button v-if="proyecto.estado === 'completado' && candidatura.estado === 'aceptada'" type="button" class="boton-estrella" @click.stop="abrirValoracion(candidatura.creativo?._id, proyecto._id)">&#9733; Valorar</button>
                        </div>
                    </article>
                </div>
                <p v-else class="meta top-gap">Sin candidaturas todavia.</p>
            </article>
            <article v-if="!app.proyectosEmpresa.length" class="tarjeta md-card"><p class="meta">Todavia no has publicado proyectos.</p></article>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    },
    methods: {
        async cambiarEstadoCandidatura(id, estado) {
            await this.app.llamarApi(`/api/candidaturas/${id}/estado`, {
                method: "PATCH",
                body: JSON.stringify({ estado })
            })
            this.app.mostrarAviso("Estado actualizado")
            await this.app.cargarVistasPrivadas()
        },
        async completarProyecto(id) {
            await this.app.llamarApi(`/api/proyectos/${id}`, {
                method: "PUT",
                body: JSON.stringify({ estado: "completado" })
            })
            this.app.mostrarAviso("Proyecto marcado como completado")
            await Promise.all([this.app.cargarProyectos(), this.app.cargarVistasPrivadas()])
        },
        async eliminarProyecto(id) {
            if (!window.confirm("Quieres eliminar este proyecto? Esta accion no se puede deshacer.")) return
            await this.app.llamarApi(`/api/proyectos/${id}`, { method: "DELETE" })
            this.app.mostrarAviso("Proyecto eliminado")
            this.app.modalProyecto = null
            await Promise.all([this.app.cargarProyectos(), this.app.cargarVistasPrivadas()])
        },
        async abrirValoracion(idUsuario, idProyecto) {
            try {
                await this.app.abrirValoracion(idUsuario, idProyecto)
            } catch (error) {
                this.app.mostrarAviso(error.message, true)
            }
        }
    }
}
</script>
