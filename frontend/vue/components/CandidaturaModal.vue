<template>
    <section class="modal">
        <div class="modal-fondo" @click="app.modalCandidatura = false"></div>
        <div class="modal-contenido">
            <button type="button" class="boton-secundario boton-cerrar-modal" @click="app.modalCandidatura = false">Cerrar</button>
            <div class="panel-titulo">
                <div>
                    <p class="etiqueta">Candidatura</p>
                    <h3>Postularme a {{ app.modalProyecto?.titulo || 'este proyecto' }}</h3>
                </div>
            </div>
            <form class="stack" @submit.prevent="app.enviarCandidatura">
                <textarea v-model="app.candidaturaFormulario.cartaPresentacion" rows="6" placeholder="Cuenta por que encajas para este proyecto"></textarea>
                <button type="submit">Enviar candidatura</button>
            </form>
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
