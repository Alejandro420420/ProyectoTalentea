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
                <button class="pestana" :class="{ activa: pestanaAdmin === 'proyectos' }" type="button" @click="pestanaAdmin = 'proyectos'">Proyectos</button>
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

        <div v-show="pestanaAdmin === 'proyectos'" class="lista-tarjetas top-gap">
            <article v-for="proyecto in proyectosAdmin" :key="proyecto._id" class="tarjeta md-card">
                <div class="cabecera-tarjeta-proyecto">
                    <div>
                        <h3>{{ proyecto.titulo }}</h3>
                        <p class="meta">
                            {{ proyecto.categoria }} - Estado: {{ proyecto.estado }} - {{ proyecto.remoto ? 'Remoto' : (proyecto.ubicacion || 'Presencial') }}
                        </p>
                    </div>
                    <button type="button" class="boton-eliminar-proyecto" @click="eliminarProyectoAdmin(proyecto._id)">X</button>
                </div>
                <p>{{ proyecto.descripcion }}</p>
                <p class="meta">Empresa: {{ proyecto.empresa?.nombreEmpresa || proyecto.empresa?.nombre || 'Sin empresa' }}</p>
                <p class="meta">Salario: {{ proyecto.salario || 0 }} EUR / {{ proyecto.frecuenciaSalario || 'mes' }}</p>
                <div>
                    <span v-for="palabra in proyecto.palabrasClave || []" :key="`${proyecto._id}-${palabra}`" class="pill">{{ palabra }}</span>
                </div>
                <div class="acciones">
                    <button type="button" class="boton-secundario" @click="abrirEdicionProyectoAdmin(proyecto)">Editar</button>
                    <button type="button" class="boton-secundario" @click="app.abrirProyecto(proyecto._id)">Ver detalle</button>
                    <button type="button" class="boton-secundario" @click="eliminarProyectoAdmin(proyecto._id)">Eliminar</button>
                </div>
            </article>
            <article v-if="!proyectosAdmin.length" class="tarjeta md-card"><p class="meta">No hay proyectos publicados.</p></article>
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
                        <label>Foto de perfil (.png)</label>
                        <div class="foto-admin-edicion">
                            <div v-html="app.renderizarAvatarHtml(edicionAdminFormulario, edicionAdminFormulario.nombreEmpresa || edicionAdminFormulario.nombre)"></div>
                            <div class="stack">
                                <input type="file" accept=".png,image/png" @change="subirFotoPerfilAdmin" />
                                <div class="acciones">
                                    <button v-if="edicionAdminFormulario.fotoPerfil" type="button" class="boton-secundario" @click="eliminarFotoPerfilAdmin">Eliminar foto</button>
                                </div>
                            </div>
                        </div>
                    </div>
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

        <section v-if="modalEdicionProyectoAdmin" class="modal">
            <div class="modal-fondo" @click="modalEdicionProyectoAdmin = false"></div>
            <div class="modal-contenido">
                <button type="button" class="boton-secundario boton-cerrar-modal" @click="modalEdicionProyectoAdmin = false">Cerrar</button>
                <div class="view-subheader">
                    <div>
                        <p class="etiqueta">Administracion</p>
                        <h3>Editar proyecto</h3>
                    </div>
                </div>
                <form class="stack top-gap" @submit.prevent="guardarProyectoAdmin">
                    <div class="form-group">
                        <label>Titulo</label>
                        <input v-model="edicionProyectoFormulario.titulo" required placeholder="Titulo del proyecto" />
                    </div>
                    <div class="form-group">
                        <label>Categoria</label>
                        <input v-model="edicionProyectoFormulario.categoria" required placeholder="Categoria" />
                    </div>
                    <div class="form-group">
                        <label>Descripcion</label>
                        <textarea v-model="edicionProyectoFormulario.descripcion" required rows="5" placeholder="Descripcion"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Palabras clave</label>
                        <input v-model="edicionProyectoFormulario.palabrasClave" placeholder="Separadas por comas" />
                    </div>
                    <div class="filtros">
                        <div class="form-group">
                            <label>Salario</label>
                            <input v-model.number="edicionProyectoFormulario.salario" type="number" min="0" placeholder="0" />
                        </div>
                        <div class="form-group">
                            <label>Frecuencia</label>
                            <select v-model="edicionProyectoFormulario.frecuenciaSalario">
                                <option value="dia">Dia</option>
                                <option value="mes">Mes</option>
                            </select>
                        </div>
                    </div>
                    <div class="filtros">
                        <div class="form-group">
                            <label>Estado</label>
                            <select v-model="edicionProyectoFormulario.estado">
                                <option value="abierto">Abierto</option>
                                <option value="cerrado">Cerrado</option>
                                <option value="completado">Completado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ubicacion</label>
                            <input v-model="edicionProyectoFormulario.ubicacion" placeholder="Ubicacion" />
                        </div>
                    </div>
                    <label class="fila-checkbox">
                        <input v-model="edicionProyectoFormulario.remoto" type="checkbox" />
                        <span>Proyecto remoto</span>
                    </label>

                    <div class="form-actions">
                        <button type="submit">Guardar cambios</button>
                        <button type="button" class="boton-secundario" @click="eliminarProyectoAdmin(edicionProyectoFormulario.idProyecto)">Eliminar proyecto</button>
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
            proyectosAdmin: [],
            auditoria: [],
            modalEdicionAdmin: false,
            modalEdicionProyectoAdmin: false,
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
                fotoPerfil: "",
                verificado: false,
                portafolio: []
            },
            edicionProyectoFormulario: {
                idProyecto: "",
                titulo: "",
                descripcion: "",
                categoria: "",
                palabrasClave: "",
                salario: 0,
                frecuenciaSalario: "mes",
                ubicacion: "",
                remoto: true,
                estado: "abierto"
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
            const [panel, usuarios, proyectos, auditoria] = await Promise.all([
                this.app.llamarApi("/api/administracion/panel"),
                this.app.llamarApi("/api/administracion/usuarios"),
                this.app.llamarApi("/api/proyectos"),
                this.app.llamarApi("/api/administracion/auditoria")
            ])
            this.metricasAdmin = panel.metricas || {}
            this.usuariosAdmin = usuarios.elementos || []
            this.proyectosAdmin = proyectos.elementos || []
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
                fotoPerfil: usuario.fotoPerfil || "",
                verificado: Boolean(usuario.verificado),
                portafolio: Array.isArray(usuario.portafolio) ? [...usuario.portafolio] : []
            }
            this.modalEdicionAdmin = true
        },
        async subirFotoPerfilAdmin(evento) {
            const archivo = evento.target.files?.[0]
            if (!archivo) return

            if (archivo.type !== "image/png") {
                this.app.mostrarAviso("La foto de perfil debe ser un archivo PNG", true)
                evento.target.value = ""
                return
            }

            const contenidoBase64 = await new Promise((resolve, reject) => {
                const lector = new FileReader()
                lector.onload = () => resolve(String(lector.result).split(",")[1] || "")
                lector.onerror = reject
                lector.readAsDataURL(archivo)
            })

            const subida = await this.app.llamarApi("/api/usuarios/subidas", {
                method: "POST",
                body: JSON.stringify({
                    nombreArchivo: archivo.name,
                    tipoMime: archivo.type,
                    contenidoBase64
                })
            })

            this.edicionAdminFormulario.fotoPerfil = subida.archivo.url
            evento.target.value = ""
            this.app.mostrarAviso("Foto de perfil lista para guardar")
        },
        eliminarFotoPerfilAdmin() {
            this.edicionAdminFormulario.fotoPerfil = ""
            this.app.mostrarAviso("Foto de perfil marcada para eliminar")
        },
        async guardarEdicionAdmin() {
            const datos = await this.app.llamarApi(`/api/administracion/usuarios/${this.edicionAdminFormulario.idUsuario}`, {
                method: "PUT",
                body: JSON.stringify(this.edicionAdminFormulario)
            })
            if (datos.usuario?._id === this.app.usuario?._id) {
                this.app.guardarSesion({ token: this.app.token, usuario: datos.usuario })
            }
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
        abrirEdicionProyectoAdmin(proyecto) {
            this.edicionProyectoFormulario = {
                idProyecto: proyecto._id,
                titulo: proyecto.titulo || "",
                descripcion: proyecto.descripcion || "",
                categoria: proyecto.categoria || "",
                palabrasClave: Array.isArray(proyecto.palabrasClave) ? proyecto.palabrasClave.join(", ") : "",
                salario: proyecto.salario || 0,
                frecuenciaSalario: proyecto.frecuenciaSalario || "mes",
                ubicacion: proyecto.ubicacion || "",
                remoto: typeof proyecto.remoto === "boolean" ? proyecto.remoto : true,
                estado: proyecto.estado || "abierto"
            }
            this.modalEdicionProyectoAdmin = true
        },
        async guardarProyectoAdmin() {
            await this.app.llamarApi(`/api/proyectos/${this.edicionProyectoFormulario.idProyecto}`, {
                method: "PUT",
                body: JSON.stringify(this.edicionProyectoFormulario)
            })
            this.modalEdicionProyectoAdmin = false
            this.app.mostrarAviso("Proyecto actualizado")
            await Promise.all([this.cargarAdministracion(), this.app.cargarProyectos()])
        },
        async eliminarProyectoAdmin(id) {
            if (!window.confirm("Quieres eliminar este proyecto? Esta accion no se puede deshacer.")) return
            await this.app.llamarApi(`/api/proyectos/${id}`, { method: "DELETE" })
            this.modalEdicionProyectoAdmin = false
            this.app.modalProyecto = null
            this.app.mostrarAviso("Proyecto eliminado")
            await Promise.all([this.cargarAdministracion(), this.app.cargarProyectos(), this.app.cargarVistasPrivadas()])
        },
        eliminarMuestraPortafolio(indice) {
            this.edicionAdminFormulario.portafolio.splice(indice, 1)
        }
    }
}
</script>

<style scoped>
.foto-admin-edicion {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}
</style>
