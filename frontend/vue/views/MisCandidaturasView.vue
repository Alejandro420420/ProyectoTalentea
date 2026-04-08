<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Usuario</p>
                <h1>Mis candidaturas</h1>
            </div>
        </div>

        <div class="lista-tarjetas">
            <article v-for="candidatura in app.misCandidaturas" :key="candidatura._id" class="tarjeta md-card">
                <h3>{{ candidatura.proyecto?.titulo || 'Proyecto eliminado' }}</h3>
                <p class="meta">Estado: {{ candidatura.estado }} - Empresa: {{ candidatura.proyecto?.empresa?.nombreEmpresa || candidatura.proyecto?.empresa?.nombre || 'Sin nombre' }}</p>
                <p>{{ candidatura.cartaPresentacion || 'Sin carta de presentacion.' }}</p>
                <p class="meta">Historial: {{ (candidatura.historialEstados || []).map((item) => item.estado).join(' -> ') || 'Sin cambios todavia' }}</p>
            </article>
            <article v-if="!app.misCandidaturas.length" class="tarjeta md-card"><p class="meta">Todavia no has enviado candidaturas.</p></article>
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
