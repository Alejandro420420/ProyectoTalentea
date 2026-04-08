<template>
    <section class="modal">
        <div class="modal-fondo" @click="app.modalProyecto = null"></div>
        <div class="modal-contenido">
            <button type="button" class="boton-secundario boton-cerrar-modal" @click="app.modalProyecto = null">Cerrar</button>
            <div class="cabecera-perfil">
                <div v-html="app.renderizarAvatarHtml(app.modalProyecto.empresa, app.modalProyecto.empresa?.nombreEmpresa)"></div>
                <div>
                    <h2>{{ app.modalProyecto.titulo }}</h2>
                    <p class="meta nombre-verificado">
                        <span>{{ app.modalProyecto.categoria }} - {{ app.modalProyecto.remoto ? 'Remoto' : (app.modalProyecto.ubicacion || 'Presencial') }}</span>
                        <span v-if="app.modalProyecto.empresa?.verificado" class="tick-verificado" title="Empresa verificada" aria-label="Empresa verificada">&#10003;</span>
                    </p>
                </div>
            </div>
            <p class="top-gap">{{ app.modalProyecto.descripcion }}</p>
            <p class="meta">Salario: {{ app.modalProyecto.salario || 0 }} EUR / {{ app.modalProyecto.frecuenciaSalario || 'mes' }}</p>
            <div>
                <span v-for="palabra in app.modalProyecto.palabrasClave || []" :key="palabra" class="pill">{{ palabra }}</span>
            </div>
            <div class="tarjeta top-gap">
                <div class="empresa-detalle">
                    <div v-html="app.renderizarAvatarHtml(app.modalProyecto.empresa, app.modalProyecto.empresa?.nombreEmpresa)"></div>
                    <div>
                        <h3 class="nombre-verificado">
                            <span>{{ app.modalProyecto.empresa?.nombreEmpresa || app.modalProyecto.empresa?.nombre || 'Empresa' }}</span>
                            <span v-if="app.modalProyecto.empresa?.verificado" class="tick-verificado" title="Empresa verificada" aria-label="Empresa verificada">&#10003;</span>
                        </h3>
                        <p class="meta">{{ app.modalProyecto.empresa?.titular || 'Empresa en Talentea' }}</p>
                    </div>
                </div>
                <p class="top-gap">{{ app.modalProyecto.empresa?.biografia || 'Sin descripcion de empresa por ahora.' }}</p>
                <p class="meta">Ubicacion: {{ app.modalProyecto.empresa?.ubicacion || 'No especificada' }}</p>
                <p class="meta">Web: {{ app.modalProyecto.empresa?.web || 'No especificada' }}</p>
                <div class="acciones">
                    <button type="button" class="boton-secundario" @click="app.abrirPerfil(app.modalProyecto.empresa?._id, app.modalProyecto._id)">Ver perfil de empresa</button>
                    <button v-if="app.esRolUsuario(app.usuario) && app.modalProyecto.estado === 'abierto'" type="button" @click="app.abrirModalCandidatura(app.modalProyecto._id)">Postularme a este proyecto</button>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    }
}
</script>
