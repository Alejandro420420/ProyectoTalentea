const { createApp, defineAsyncComponent } = Vue
const { loadModule } = window["vue3-sfc-loader"]
const { crearEstadoInicial } = window.TalenteaState
const helpers = window.TalenteaHelpers
const actions = window.TalenteaActions

const opciones = {
    moduleCache: { vue: Vue },
    async getFile(url) {
        const respuesta = await fetch(url)
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${url}`)
        }
        return respuesta.text()
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement("style"), { textContent })
        document.head.appendChild(style)
    }
}

const cargar = (ruta) => defineAsyncComponent(() => loadModule(ruta, opciones))

createApp({
    components: {
        AccessView: cargar("/vue/views/AccessView.vue"),
        InicioView: cargar("/vue/views/InicioView.vue"),
        PerfilView: cargar("/vue/views/PerfilView.vue"),
        ProyectosView: cargar("/vue/views/ProyectosView.vue"),
        TalentoView: cargar("/vue/views/TalentoView.vue"),
        MisCandidaturasView: cargar("/vue/views/MisCandidaturasView.vue"),
        EmpresaView: cargar("/vue/views/EmpresaView.vue"),
        GestionEmpresaView: cargar("/vue/views/GestionEmpresaView.vue"),
        ValoracionesView: cargar("/vue/views/ValoracionesView.vue"),
        AdministracionView: cargar("/vue/views/AdministracionView.vue"),
        ProyectoModal: cargar("/vue/components/ProyectoModal.vue"),
        PerfilModal: cargar("/vue/components/PerfilModal.vue"),
        CandidaturaModal: cargar("/vue/components/CandidaturaModal.vue")
    },
    data() {
        return crearEstadoInicial()
    },
    computed: {
        viewModel() {
            return this
        },
        gruposNavegacion() {
            const grupos = [
                {
                    icono: "home",
                    secciones: [
                        { id: "inicio", etiqueta: "Inicio" },
                        { id: "perfil", etiqueta: "Perfil" },
                        { id: "proyectos", etiqueta: "Proyectos" },
                        { id: "talento", etiqueta: "Talento" }
                    ]
                }
            ]

            if (this.esRolUsuario(this.usuario)) {
                grupos.push({
                    icono: "user",
                    secciones: [
                        { id: "mis-candidaturas", etiqueta: "Mis candidaturas" },
                        { id: "valoraciones", etiqueta: "Valorar trabajo" }
                    ]
                })
            }

            if (this.usuario?.rol === "empresa") {
                grupos.push({
                    icono: "briefcase",
                    secciones: [
                        { id: "empresa", etiqueta: "Publicar proyecto" },
                        { id: "gestion-empresa", etiqueta: "Gestionar candidaturas" },
                        { id: "valoraciones", etiqueta: "Valorar trabajo" }
                    ]
                })
            }

            if (this.usuario?.rol === "admin") {
                grupos.push({
                    icono: "shield",
                    secciones: [{ id: "administracion", etiqueta: "Administracion" }]
                })
            }

            return grupos
        },
        estadoSesionTexto() {
            if (!this.usuario) return "No has iniciado sesion"
            return `${this.usuario.nombre} - ${this.obtenerTextoRol(this.usuario.rol)} - ${this.usuario.verificado ? "verificado" : "sin verificar"}`
        },
        destinatariosValoracion() {
            const proyecto = this.opcionesValoracion.find((item) => item.id === this.valoracionFormulario.idProyecto)
            const destinatarios = proyecto?.destinatarios || []
            if (!this.valoracionFijada.bloqueada) return destinatarios
            return destinatarios.filter((item) => item.id === this.valoracionFijada.idDestinatario)
        },
        componenteVistaActual() {
            const mapa = {
                inicio: this.$options.components.InicioView,
                perfil: this.$options.components.PerfilView,
                proyectos: this.$options.components.ProyectosView,
                talento: this.$options.components.TalentoView,
                "mis-candidaturas": this.$options.components.MisCandidaturasView,
                empresa: this.$options.components.EmpresaView,
                "gestion-empresa": this.$options.components.GestionEmpresaView,
                valoraciones: this.$options.components.ValoracionesView,
                administracion: this.$options.components.AdministracionView
            }
            return mapa[this.seccionActiva] || this.$options.components.InicioView
        }
    },
    watch: {
        tema() {
            this.aplicarTema()
        },
        "valoracionFormulario.idProyecto"() {
            if (this.valoracionFijada.bloqueada) {
                this.valoracionFormulario.idDestinatario = this.valoracionFijada.idDestinatario
            } else {
                this.valoracionFormulario.idDestinatario = ""
            }
        }
    },
    methods: {
        ...helpers,
        ...actions
    },
    async mounted() {
        await this.inicializar()
    },
    template: `
        <div>
            <div class="fondo"></div>
            <div class="contenedor">
                <header class="cabecera">
                    <div class="marca-principal">
                        <img class="logo-principal" src="/img/Talentea.png" alt="Logo Talentea" />
                        <p class="eslogan-principal">Haz que pase</p>
                    </div>
                    <nav v-if="usuario" class="navegacion-panel">
                        <div v-for="grupo in gruposNavegacion" :key="grupo.icono" class="grupo-navegacion">
                            <span class="titulo-grupo" v-html="iconoGrupo(grupo.icono)"></span>
                            <button v-for="seccion in grupo.secciones" :key="seccion.id" type="button" :class="{ activa: seccionActiva === seccion.id }" @click="seleccionarSeccion(seccion.id)">{{ seccion.etiqueta }}</button>
                        </div>
                    </nav>
                    <div class="acciones-cabecera">
                        <button class="boton-secundario boton-icono" type="button" @click="cambiarTema">{{ tema === 'oscuro' ? 'Claro' : 'Oscuro' }}</button>
                        <button v-if="usuario" class="boton-secundario" type="button" @click="cerrarSesion">Cerrar sesion</button>
                    </div>
                </header>

                <main class="layout">
                    <AccessView v-if="!usuario" :app="viewModel" />
                    <section v-else>
                        <div class="barra-panel">
                            <div class="estado-panel">
                                <p class="etiqueta">Sesion</p>
                                <h2>{{ estadoSesionTexto }}</h2>
                            </div>
                        </div>
                        <component :is="componenteVistaActual" :app="viewModel"></component>
                    </section>
                </main>

                <ProyectoModal v-if="modalProyecto" :app="viewModel" />
                <PerfilModal v-if="modalPerfil" :app="viewModel" />
                <CandidaturaModal v-if="modalCandidatura" :app="viewModel" />

                <div id="aviso" :class="{ show: aviso.visible, error: aviso.error }">{{ aviso.mensaje }}</div>
            </div>
        </div>
    `
}).mount("#aplicacionVue")
