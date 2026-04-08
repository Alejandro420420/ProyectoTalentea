<template>
    <section class="modal">
        <div class="modal-fondo" @click="cerrarPerfil"></div>
        <div class="modal-contenido">
            <button type="button" class="boton-secundario boton-cerrar-modal" @click="cerrarPerfil">Cerrar</button>
            <div class="encabezado-detalle">
                <div v-html="app.renderizarAvatarHtml(app.modalPerfil.usuario, app.modalPerfil.usuario?.nombreEmpresa || app.modalPerfil.usuario?.nombre)"></div>
                <div>
                    <h2 class="nombre-verificado">
                        <span>{{ app.modalPerfil.usuario?.nombreEmpresa || app.modalPerfil.usuario?.nombre }}</span>
                        <span v-if="app.modalPerfil.usuario?.verificado" class="tick-verificado" title="Perfil verificado" aria-label="Perfil verificado">&#10003;</span>
                    </h2>
                    <p class="meta">{{ app.modalPerfil.usuario?.estudios || app.modalPerfil.usuario?.titular || 'Sin estudios' }} - {{ app.obtenerTextoRol(app.modalPerfil.usuario?.rol) }}</p>
                </div>
            </div>
            <p class="top-gap">{{ app.modalPerfil.usuario?.biografia || 'Sin biografia todavia.' }}</p>
            <div>
                <span v-for="categoria in app.modalPerfil.usuario?.categorias || []" :key="categoria" class="pill">{{ categoria }}</span>
            </div>
            <div>
                <span v-for="habilidad in app.modalPerfil.usuario?.habilidades || []" :key="habilidad" class="pill">{{ habilidad }}</span>
            </div>
            <div class="top-gap">
                <h3>Muestras destacadas</h3>
                <div class="detalle-valoraciones">
                    <article v-for="(elemento, indice) in app.modalPerfil.usuario?.portafolio || []" :key="indice" class="tarjeta">
                        <div class="media-card">
                            <img
                                v-if="obtenerTipo(elemento) === 'imagen'"
                                class="preview-portafolio media-card-clickable"
                                :src="obtenerUrl(elemento)"
                                :alt="elemento.titulo || 'Muestra'"
                                @click="abrirVisor(elemento)"
                            />

                            <div v-else-if="obtenerTipo(elemento) === 'video'" class="media-card-video">
                                <video class="preview-video" controls :src="obtenerUrl(elemento)"></video>
                                <button type="button" class="boton-secundario media-expandir" @click="abrirVisor(elemento)">Maximizar video</button>
                            </div>

                            <audio v-else-if="obtenerTipo(elemento) === 'audio'" class="preview-audio" controls :src="obtenerUrl(elemento)"></audio>

                            <a v-else class="enlace-portafolio" :href="obtenerUrl(elemento)" target="_blank" rel="noreferrer">Abrir muestra</a>
                        </div>

                        <h3 class="top-gap">{{ elemento.titulo || 'Muestra' }}</h3>
                        <p class="meta">{{ elemento.categoria || 'Sin categoria' }}</p>
                        <p>{{ elemento.descripcion || 'Sin descripcion.' }}</p>
                    </article>
                    <p v-if="!(app.modalPerfil.usuario?.portafolio || []).length" class="meta">Este perfil todavia no ha subido muestras.</p>
                </div>
            </div>
            <div class="acciones top-gap">
                <button v-if="app.modalPerfil.puedeValorar" type="button" class="boton-estrella" @click="app.abrirValoracion(app.modalPerfil.usuario?._id, app.modalPerfil.proyectoContexto).catch((error) => app.mostrarAviso(error.message, true))">&#9733; Valorar a esta persona</button>
                <p v-else class="meta">Podras valorar a esta persona cuando tenga una colaboracion aceptada y completada contigo.</p>
            </div>
            <div class="top-gap">
                <h3>Valoraciones</h3>
                <div class="detalle-valoraciones">
                    <article v-for="valoracion in app.modalPerfil.valoraciones || []" :key="valoracion._id" class="tarjeta">
                        <p><strong>{{ valoracion.puntuacion }}/5</strong> - {{ valoracion.proyecto?.titulo || 'Proyecto' }}</p>
                        <p class="meta">Por {{ valoracion.autor?.nombre || valoracion.autor?.nombreEmpresa || 'Usuario' }}</p>
                        <p>{{ valoracion.comentario || 'Sin comentario.' }}</p>
                    </article>
                    <p v-if="!(app.modalPerfil.valoraciones || []).length" class="meta">Todavia no hay valoraciones visibles.</p>
                </div>
            </div>
        </div>

        <section v-if="visorMedia.visible" class="modal media-viewer">
            <div class="modal-fondo" @click="cerrarVisor"></div>
            <div class="modal-contenido media-viewer-contenido">
                <button type="button" class="boton-secundario boton-cerrar-modal" @click="cerrarVisor">Cerrar</button>

                <img
                    v-if="visorMedia.tipo === 'imagen'"
                    class="media-viewer-imagen"
                    :src="visorMedia.url"
                    :alt="visorMedia.titulo || 'Muestra ampliada'"
                />

                <video
                    v-else-if="visorMedia.tipo === 'video'"
                    class="media-viewer-video"
                    :src="visorMedia.url"
                    controls
                    autoplay
                ></video>
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
            visorMedia: {
                visible: false,
                tipo: "",
                url: "",
                titulo: ""
            }
        }
    },
    methods: {
        obtenerUrl(elemento) {
            return elemento.urlMedia || elemento.urlProyecto || ""
        },
        obtenerTipo(elemento) {
            return this.app.obtenerTipoMedia(this.obtenerUrl(elemento))
        },
        abrirVisor(elemento) {
            const tipo = this.obtenerTipo(elemento)
            if (tipo !== "imagen" && tipo !== "video") return

            this.visorMedia = {
                visible: true,
                tipo,
                url: this.obtenerUrl(elemento),
                titulo: elemento.titulo || "Muestra"
            }
        },
        cerrarVisor() {
            this.visorMedia = {
                visible: false,
                tipo: "",
                url: "",
                titulo: ""
            }
        },
        cerrarPerfil() {
            this.cerrarVisor()
            this.app.modalPerfil = null
        }
    }
}
</script>

<style scoped>
.media-card-clickable {
    cursor: zoom-in;
}

.media-card-video {
    display: grid;
    gap: 10px;
}

.media-expandir {
    justify-self: start;
}

.media-viewer {
    z-index: 60;
}

.media-viewer-contenido {
    width: min(1100px, calc(100% - 24px));
}

.media-viewer-imagen,
.media-viewer-video {
    display: block;
    width: 100%;
    max-height: calc(100vh - 180px);
    object-fit: contain;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.35);
}
</style>
