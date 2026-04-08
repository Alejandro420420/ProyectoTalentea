<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Entrada</p>
                <h1>Accede a la plataforma</h1>
            </div>
        </div>

        <div class="panel acceso-panel md-card">
            <div class="selector-formulario">
                <button class="pestana" :class="{ activa: app.vistaAcceso === 'login' }" type="button" @click="app.vistaAcceso = 'login'">Entrar</button>
                <button class="pestana" :class="{ activa: app.vistaAcceso === 'registro' }" type="button" @click="app.vistaAcceso = 'registro'">Crear cuenta</button>
            </div>

            <form v-if="app.vistaAcceso === 'login'" class="stack top-gap" @submit.prevent="enviarLogin">
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="app.login.email" type="email" placeholder="Email" required />
                </div>
                <div class="form-group">
                    <label>Contrasena</label>
                    <input v-model="app.login.password" type="password" placeholder="Contrasena" required />
                </div>
                <div class="form-actions">
                    <button type="submit">Entrar</button>
                </div>
            </form>

            <form v-else class="stack top-gap" @submit.prevent="enviarRegistro">
                <div class="form-group">
                    <label>Nombre completo</label>
                    <input v-model="app.registro.nombre" placeholder="Nombre completo" required />
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="app.registro.email" type="email" placeholder="Email" required />
                </div>
                <div class="form-group">
                    <label>Contrasena</label>
                    <input v-model="app.registro.password" type="password" placeholder="Contrasena" required />
                </div>
                <div class="form-group">
                    <label>Tipo de cuenta</label>
                    <select v-model="app.registro.rol">
                        <option value="usuario">Usuario</option>
                        <option value="empresa">Empresa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nombre de empresa</label>
                    <input v-model="app.registro.nombreEmpresa" placeholder="Nombre de empresa (si aplica)" />
                </div>
                <div class="form-actions">
                    <button type="submit">Crear cuenta</button>
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
        async enviarRegistro() {
            const datos = await this.app.llamarApi("/api/autenticacion/registro", {
                method: "POST",
                body: JSON.stringify(this.app.registro)
            })
            this.app.guardarSesion(datos)
            this.app.mostrarAviso("Cuenta creada correctamente")
            await Promise.all([
                this.app.cargarProyectos(),
                this.app.cargarTalento(),
                this.app.cargarVistasPrivadas(),
                this.app.cargarEmpresasInicio()
            ])
        },
        async enviarLogin() {
            const datos = await this.app.llamarApi("/api/autenticacion/login", {
                method: "POST",
                body: JSON.stringify(this.app.login)
            })
            this.app.guardarSesion(datos)
            this.app.mostrarAviso("Sesion iniciada")
            await Promise.all([
                this.app.cargarProyectos(),
                this.app.cargarTalento(),
                this.app.cargarVistasPrivadas(),
                this.app.cargarEmpresasInicio()
            ])
        }
    }
}
</script>
