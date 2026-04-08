<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Talento</p>
                <h1>Perfiles disponibles</h1>
            </div>
            <button class="boton-secundario" type="button" @click="cargarTalento">Actualizar</button>
        </div>

        <div class="panel seccion-panel md-card">
            <div class="filtros">
                <div class="form-group">
                    <label>Busqueda</label>
                    <input v-model="app.filtros.busquedaTalento" placeholder="Buscar por palabra clave" @input="cargarTalento" />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <input v-model="app.filtros.categoriaTalento" placeholder="Filtrar por categoria" @input="cargarTalento" />
                </div>
            </div>
        </div>

        <div class="lista-tarjetas top-gap">
            <article v-for="persona in app.talento" :key="persona._id" class="tarjeta tarjeta-clickable md-card" @click="app.abrirPerfil(persona._id)">
                <div class="cabecera-perfil">
                    <div v-html="app.renderizarAvatarHtml(persona, persona.nombre)"></div>
                    <div>
                        <h3 class="nombre-verificado">
                            <span>{{ persona.nombre }}</span>
                            <span v-if="persona.verificado" class="tick-verificado" title="Perfil verificado" aria-label="Perfil verificado">&#10003;</span>
                        </h3>
                    </div>
                </div>
                <p class="meta">{{ persona.titular || 'Sin titular' }} - Rating {{ persona.valoracionMedia || 0 }} ({{ persona.totalValoraciones || 0 }})</p>
                <p>{{ persona.biografia || 'Sin biografia todavia.' }}</p>
                <div>
                    <span v-for="categoria in persona.categorias || []" :key="categoria" class="pill">{{ categoria }}</span>
                </div>
                <div>
                    <span v-for="habilidad in persona.habilidades || []" :key="habilidad" class="pill pill-habilidad">{{ habilidad }}</span>
                </div>
                <div class="acciones">
                    <button type="button" class="boton-secundario" @click.stop="app.abrirPerfil(persona._id)">Ver perfil</button>
                    <button v-if="app.usuario" type="button" class="boton-estrella" @click.stop="abrirValoracion(persona._id)">&#9733; Valorar</button>
                </div>
            </article>
            <article v-if="!app.talento.length" class="tarjeta md-card"><p class="meta">No hay perfiles para esos filtros.</p></article>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    },
    methods: {
        async cargarTalento() {
            const parametros = new URLSearchParams()
            if (this.app.filtros.busquedaTalento.trim()) parametros.set("palabraClave", this.app.filtros.busquedaTalento.trim())
            if (this.app.filtros.categoriaTalento.trim()) parametros.set("categoria", this.app.filtros.categoriaTalento.trim())
            const datos = await this.app.llamarApi(`/api/usuarios?${parametros.toString()}`)
            this.app.talento = datos.elementos || []
        },
        async abrirValoracion(idUsuario) {
            try {
                await this.app.abrirValoracion(idUsuario)
            } catch (error) {
                this.app.mostrarAviso(error.message, true)
            }
        }
    }
}
</script>
