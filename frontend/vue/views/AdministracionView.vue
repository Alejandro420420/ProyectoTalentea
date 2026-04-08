<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Administracion</p>
                <h1>Control general de la plataforma</h1>
            </div>
        </div>

        <div class="panel seccion-panel md-card">
            <div class="metricas">
                <div v-for="(valor, clave) in metricasAdmin" :key="clave">
                    <span class="meta">{{ clave }}</span>
                    <h3>{{ valor }}</h3>
                </div>
            </div>

            <div class="selector-formulario top-gap">
                <button class="pestana" :class="{ activa: pestanaAdmin === 'verificaciones' }" type="button" @click="pestanaAdmin = 'verificaciones'">Verificacion</button>
                <button class="pestana" :class="{ activa: pestanaAdmin === 'usuarios' }" type="button" @click="pestanaAdmin = 'usuarios'">Usuarios</button>
                <button class="pestana" :class="{ activa: pestanaAdmin === 'empresas' }" type="button" @click="pestanaAdmin = 'empresas'">Empresas</button>
                <button class="pestana" :class="{ activa: pestanaAdmin === 'auditoria' }" type="button" @click="pestanaAdmin = 'auditoria'">Auditoria</button>
            </div>
        </div>

        <div v-show="pestanaAdmin === 'verificaciones'" class="lista-tarjetas top-gap">
            <article v-for="item in verificacionesPendientes" :key="item._id" class="tarjeta md-card">
                <h3>{{ item.nombreEmpresa || item.nombre }}</h3>
                <p class="meta">{{ app.obtenerTextoRol(item.rol) }} - {{ item.email }}</p>
                <p>{{ item.nombreEmpresa || item.estudios || item.titular || item.biografia || 'Sin informacion ampliada.' }}</p>
                <div class="acciones">
                    <button type="button" @click="verificarUsuario(item._id, true)">Verificar</button>
                    <button type="button" class="boton-secundario" @click="abrirEdicionAdmin(item)">Editar</button>
                </div>
            </article>
            <article v-if="!verificacionesPendientes.length" class="tarjeta md-card"><p class="meta">No hay verificaciones pendientes.</p></article>
        </div>

        <div v-show="pestanaAdmin === 'usuarios'" class="lista-tarjetas top-gap">
            <article v-for="item in usuariosCreativos" :key="item._id" class="tarjeta md-card">
                <h3>{{ item.nombre }}</h3>
                <p class="meta">{{ app.obtenerTextoRol(item.rol) }} - {{ item.email }} - {{ item.verificado ? 'Verificado' : 'Pendiente' }}</p>
                <p>{{ item.estudios || item.titular || item.biografia || 'Sin informacion ampliada.' }}</p>
                <div class="acciones">
                    <button type="button" @click="verificarUsuario(item._id, true)">Verificar</button>
                    <button type="button" class="boton-secundario" @click="verificarUsuario(item._id, false)">Quitar verificacion</button>
                    <button type="button" class="boton-secundario" @click="abrirEdicionAdmin(item)">Editar</button>
                    <button type="button" class="boton-secundario" @click="eliminarUsuarioAdmin(item._id)">Eliminar</button>
                </div>
            </article>
            <article v-if="!usuariosCreativos.length" class="tarjeta md-card"><p class="meta">No hay usuarios registrados.</p></article>
        </div>

        <div v-show="pestanaAdmin === 'empresas'" class="lista-tarjetas top-gap">
            <article v-for="item in empresasAdmin" :key="item._id" class="tarjeta md-card">
                <h3>{{ item.nombreEmpresa || item.nombre }}</h3>
                <p class="meta">Empresa - {{ item.email }} - {{ item.verificado ? 'Verificada' : 'Pendiente' }}</p>
                <p>{{ item.estudios || item.titular || item.biografia || 'Sin descripcion ampliada.' }}</p>
                <p class="meta">Ubicacion: {{ item.ubicacion || 'No indicada' }}</p>
                <div class="acciones">
                    <button type="button" @click="verificarUsuario(item._id, true)">Verificar</button>
                    <button type="button" class="boton-secundario" @click="verificarUsuario(item._id, false)">Quitar verificacion</button>
                    <button type="button" class="boton-secundario" @click="abrirEdicionAdmin(item)">Editar</button>
                    <button type="button" class="boton-secundario" @click="eliminarUsuarioAdmin(item._id)">Eliminar</button>
                </div>
            </article>
            <article v-if="!empresasAdmin.length" class="tarjeta md-card"><p class="meta">No hay empresas registradas.</p></article>
        </div>

        <div v-show="pestanaAdmin === 'auditoria'" class="lista-tarjetas top-gap">
            <article v-for="registro in auditoria" :key="registro._id" class="tarjeta md-card">
                <h3>{{ registro.accion }}</h3>
                <p class="meta">{{ new Date(registro.createdAt).toLocaleString() }} - {{ registro.tipoEntidad }} - {{ registro.actor?.nombre || 'Sistema' }}</p>
            </article>
            <article v-if="!auditoria.length" class="tarjeta md-card"><p class="meta">Todavia no hay registros.</p></article>
        </div>

        <section v-if="modalEdicionAdmin" class="modal">
            <div class="modal-fondo" @click="modalEdicionAdmin = false"></div>
            <div class="modal-contenido">
                <button type="button" class="boton-secundario boton-cerrar-modal" @click="modalEdicionAdmin = false">Cerrar</button>
                <div class="view-subheader">
                    <div>
                        <p class="etiqueta">Administracion</p>
                        <h3>Editar perfil</h3>
                    </div>
                </div>
                <form class="stack top-gap" @submit.prevent="guardarEdicionAdmin">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input v-model="edicionAdminFormulario.nombre" placeholder="Nombre" />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="edicionAdminFormulario.email" type="email" placeholder="Email" />
                    </div>
                    <div class="form-group">
                        <label>Rol</label>
                        <select v-model="edicionAdminFormulario.rol">
                            <option value="usuario">Usuario</option>
                            <option value="empresa">Empresa</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estudios</label>
                        <input v-model="edicionAdminFormulario.estudios" placeholder="Estudios" />
                    </div>
                    <div class="form-group">
                        <label>Nombre comercial</label>
                        <input v-model="edicionAdminFormulario.nombreEmpresa" placeholder="Nombre comercial" />
                    </div>
                    <div class="form-group">
                        <label>Ubicacion</label>
                        <input v-model="edicionAdminFormulario.ubicacion" placeholder="Ubicacion" />
                    </div>
                    <div class="form-group">
                        <label>Web</label>
                        <input v-model="edicionAdminFormulario.web" placeholder="Web" />
                    </div>
                    <div class="form-group">
                        <label>Biografia</label>
                        <textarea v-model="edicionAdminFormulario.biografia" rows="4" placeholder="Biografia"></textarea>
                    </div>
                    <label class="fila-checkbox">
                        <input v-model="edicionAdminFormulario.verificado" type="checkbox" />
                        <span>Perfil verificado</span>
                    </label>

                    <div class="bloque-portafolio">
                        <div class="view-subheader">
                            <div>
                                <p class="etiqueta">Muestras</p>
                                <h3>Portfolio del perfil</h3>
                            </div>
                        </div>
                        <div class="lista-tarjetas">
                            <article v-for="(elemento, indice) in edicionAdminFormulario.portafolio" :key="elemento._id || indice" class="tarjeta md-card">
                                <div v-html="app.renderizarMediaHtml(elemento)"></div>
                                <h3 class="top-gap">{{ elemento.titulo || 'Muestra' }}</h3>
                                <p class="meta">{{ elemento.categoria || 'Sin categoria' }}</p>
                                <p>{{ elemento.descripcion || 'Sin descripcion.' }}</p>
                                <div class="acciones">
                                    <button type="button" class="boton-secundario" @click="eliminarMuestraPortafolio(indice)">Eliminar muestra</button>
                                </div>
                            </article>
                            <article v-if="!edicionAdminFormulario.portafolio.length" class="tarjeta md-card">
                                <p class="meta">Este perfil no tiene muestras subidas.</p>
                            </article>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </section>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    },
    data() {
        return {
            pestanaAdmin: "verificaciones",
            metricasAdmin: {},
            usuariosAdmin: [],
            auditoria: [],
            modalEdicionAdmin: false,
            edicionAdminFormulario: {
                idUsuario: "",
                nombre: "",
                email: "",
                rol: "usuario",
                estudios: "",
                nombreEmpresa: "",
                ubicacion: "",
                web: "",
                biografia: "",
                verificado: false,
                portafolio: []
            }
        }
    },
    computed: {
        verificacionesPendientes() {
            return this.usuariosAdmin.filter((usuario) => usuario.rol !== "admin" && !usuario.verificado)
        },
        usuariosCreativos() {
            return this.usuariosAdmin.filter((usuario) => usuario.rol === "usuario" || usuario.rol === "creativo")
        },
        empresasAdmin() {
            return this.usuariosAdmin.filter((usuario) => usuario.rol === "empresa")
        }
    },
    async mounted() {
        await this.cargarAdministracion()
    },
    methods: {
        async cargarAdministracion() {
            const [panel, usuarios, auditoria] = await Promise.all([
                this.app.llamarApi("/api/administracion/panel"),
                this.app.llamarApi("/api/administracion/usuarios"),
                this.app.llamarApi("/api/administracion/auditoria")
            ])
            this.metricasAdmin = panel.metricas || {}
            this.usuariosAdmin = usuarios.elementos || []
            this.auditoria = auditoria.elementos || []
        },
        abrirEdicionAdmin(usuario) {
            this.edicionAdminFormulario = {
                idUsuario: usuario._id,
                nombre: usuario.nombre || "",
                email: usuario.email || "",
                rol: this.app.obtenerTextoRol(usuario.rol) || "usuario",
                estudios: usuario.estudios || usuario.titular || "",
                nombreEmpresa: usuario.nombreEmpresa || "",
                ubicacion: usuario.ubicacion || "",
                web: usuario.web || "",
                biografia: usuario.biografia || "",
                verificado: Boolean(usuario.verificado),
                portafolio: Array.isArray(usuario.portafolio) ? [...usuario.portafolio] : []
            }
            this.modalEdicionAdmin = true
        },
        async guardarEdicionAdmin() {
            await this.app.llamarApi(`/api/administracion/usuarios/${this.edicionAdminFormulario.idUsuario}`, {
                method: "PUT",
                body: JSON.stringify(this.edicionAdminFormulario)
            })
            this.modalEdicionAdmin = false
            this.app.mostrarAviso("Usuario actualizado")
            await this.cargarAdministracion()
        },
        async verificarUsuario(id, verificado) {
            await this.app.llamarApi(`/api/administracion/usuarios/${id}/verificacion`, {
                method: "PATCH",
                body: JSON.stringify({ verificado })
            })
            this.app.mostrarAviso("Verificacion actualizada")
            await this.cargarAdministracion()
        },
        async eliminarUsuarioAdmin(id) {
            if (!window.confirm("Quieres eliminar este usuario o empresa? Esta accion no se puede deshacer.")) return
            await this.app.llamarApi(`/api/administracion/usuarios/${id}`, { method: "DELETE" })
            this.app.mostrarAviso("Usuario eliminado")
            await this.cargarAdministracion()
        },
        eliminarMuestraPortafolio(indice) {
            this.edicionAdminFormulario.portafolio.splice(indice, 1)
        }
    }
}
</script>
