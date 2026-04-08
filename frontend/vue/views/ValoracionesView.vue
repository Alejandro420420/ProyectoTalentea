<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Valoraciones</p>
                <h1>Valorar trabajo realizado</h1>
            </div>
        </div>

        <div class="panel seccion-panel md-card">
            <form class="stack" @submit.prevent="enviarValoracion">
                <div class="form-group">
                    <label>Proyecto</label>
                    <select v-model="app.valoracionFormulario.idProyecto">
                        <option value="">Selecciona un proyecto</option>
                        <option v-for="opcion in app.opcionesValoracion" :key="opcion.id" :value="opcion.id">{{ opcion.titulo }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Persona</label>
                    <select v-model="app.valoracionFormulario.idDestinatario" :disabled="app.valoracionFijada.bloqueada">
                        <option value="">Selecciona una persona</option>
                        <option v-for="destinatario in app.destinatariosValoracion" :key="destinatario.id" :value="destinatario.id">{{ destinatario.nombre }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Puntuacion</label>
                    <select v-model="app.valoracionFormulario.puntuacion" required>
                        <option value="">Puntuacion</option>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Comentario</label>
                    <textarea v-model="app.valoracionFormulario.comentario" rows="4" placeholder="Comentario sobre la colaboracion"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit">Enviar valoracion</button>
                </div>
            </form>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    },
    methods: {
        async enviarValoracion() {
            if (!this.app.valoracionFormulario.idProyecto || !this.app.valoracionFormulario.idDestinatario) {
                this.app.mostrarAviso("Selecciona un proyecto y una persona validos antes de valorar", true)
                return
            }
            await this.app.llamarApi("/api/valoraciones", {
                method: "POST",
                body: JSON.stringify({
                    ...this.app.valoracionFormulario,
                    puntuacion: Number(this.app.valoracionFormulario.puntuacion)
                })
            })
            this.app.valoracionFormulario = { idProyecto: "", idDestinatario: "", puntuacion: "", comentario: "" }
            this.app.valoracionFijada = { idDestinatario: "", bloqueada: false }
            this.app.mostrarAviso("Valoracion enviada")
            await Promise.all([this.app.cargarTalento(), this.app.cargarVistasPrivadas()])
        }
    }
}
</script>
