<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Empresa</p>
                <h1>Publicar proyecto</h1>
            </div>
        </div>

        <div class="panel seccion-panel md-card">
            <form class="stack" @submit.prevent="publicarProyecto">
                <div class="form-group">
                    <label>Titulo del proyecto</label>
                    <input v-model="app.proyectoFormulario.titulo" placeholder="Titulo del proyecto" required />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <input v-model="app.proyectoFormulario.categoria" placeholder="Categoria" required />
                </div>
                <div class="form-group">
                    <label>Palabras clave</label>
                    <input v-model="app.proyectoFormulario.palabrasClave" placeholder="Palabras clave separadas por comas" />
                </div>
                <div class="filtros">
                    <div class="form-group">
                        <label>Salario</label>
                        <input v-model="app.proyectoFormulario.salario" type="number" min="0" placeholder="Salario" required />
                    </div>
                    <div class="form-group">
                        <label>Frecuencia salarial</label>
                        <select v-model="app.proyectoFormulario.frecuenciaSalario">
                            <option value="mes">Salario / mes</option>
                            <option value="dia">Salario / dia</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Ubicacion</label>
                    <input v-model="app.proyectoFormulario.ubicacion" placeholder="Ubicacion" />
                </div>
                <label class="fila-checkbox">
                    <input v-model="app.proyectoFormulario.remoto" type="checkbox" />
                    <span>Trabajo remoto</span>
                </label>
                <div class="form-group">
                    <label>Descripcion</label>
                    <textarea v-model="app.proyectoFormulario.descripcion" rows="5" placeholder="Describe el proyecto" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" :disabled="app.enviandoProyecto">{{ app.enviandoProyecto ? 'Publicando...' : 'Crear proyecto' }}</button>
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
        async publicarProyecto() {
            if (this.app.enviandoProyecto) return
            this.app.enviandoProyecto = true
            try {
                await this.app.llamarApi("/api/proyectos", {
                    method: "POST",
                    body: JSON.stringify({ ...this.app.proyectoFormulario, salario: Number(this.app.proyectoFormulario.salario || 0) })
                })
                this.app.proyectoFormulario = {
                    titulo: "",
                    categoria: "",
                    palabrasClave: "",
                    salario: "",
                    frecuenciaSalario: "mes",
                    ubicacion: "",
                    remoto: true,
                    descripcion: ""
                }
                this.app.mostrarAviso("Proyecto publicado")
                this.app.seccionActiva = "gestion-empresa"
                await Promise.all([this.app.cargarProyectos(), this.app.cargarVistasPrivadas()])
            } finally {
                this.app.enviandoProyecto = false
            }
        }
    }
}
</script>
