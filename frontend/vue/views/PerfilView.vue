<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Perfil</p>
                <h1>Editar perfil profesional</h1>
            </div>
        </div>

        <div class="panel seccion-panel md-card">
            <form class="stack" @submit.prevent="guardarPerfil">
                <div class="form-group">
                    <label>Foto de perfil (.png)</label>
                    <input type="file" accept=".png,image/png" @change="subirFotoPerfil" />
                    <p v-if="app.perfil.fotoPerfil" class="meta top-gap">Imagen actual subida correctamente.</p>
                </div>
                <div class="form-group">
                    <label>Nombre visible</label>
                    <input v-model="app.perfil.nombre" placeholder="Nombre visible" />
                </div>
                <div class="form-group">
                    <label>Estudios</label>
                    <input v-model="app.perfil.estudios" placeholder="Estudios" />
                </div>
                <div class="form-group">
                    <label>Ubicacion</label>
                    <input v-model="app.perfil.ubicacion" placeholder="Ubicacion" />
                </div>
                <div class="form-group">
                    <label>Web o portfolio principal</label>
                    <input v-model="app.perfil.web" placeholder="Web o portafolio principal" />
                </div>
                <div class="form-group">
                    <label>Nombre comercial</label>
                    <input v-model="app.perfil.nombreEmpresa" placeholder="Nombre comercial" />
                </div>
                <div class="form-group">
                    <label>Categorias</label>
                    <input v-model="app.perfil.categorias" placeholder="Categorias separadas por comas" />
                </div>
                <div class="form-group">
                    <label>Habilidades</label>
                    <input v-model="app.perfil.habilidades" placeholder="Habilidades separadas por comas" />
                </div>
                <div class="form-group">
                    <label>Intereses</label>
                    <input v-model="app.perfil.intereses" placeholder="Intereses separadas por comas" />
                </div>
                <div class="form-group">
                    <label>Presentacion</label>
                    <textarea v-model="app.perfil.biografia" rows="4" placeholder="Presentacion"></textarea>
                </div>

                <div class="bloque-portafolio">
                    <div class="view-subheader"><div><p class="etiqueta">Muestras</p><h3>Sube imagenes, mp3 o mp4</h3></div></div>
                    <div class="form-group">
                        <label>Archivo</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.mp3,.mp4,image/*,audio/mpeg,video/mp4" @change="subirArchivoPortafolio" />
                    </div>
                    <div class="lista-tarjetas">
                        <article v-for="(elemento, indice) in app.portafolioEdicion" :key="indice" class="tarjeta md-card">
                            <div v-html="app.renderizarMediaHtml(elemento)"></div>
                            <div class="form-group top-gap">
                                <label>Titulo</label>
                                <input v-model="elemento.titulo" placeholder="Titulo de la muestra" />
                            </div>
                            <div class="form-group">
                                <label>Categoria</label>
                                <input v-model="elemento.categoria" placeholder="Categoria de la muestra" />
                            </div>
                            <div class="form-group">
                                <label>Descripcion</label>
                                <textarea v-model="elemento.descripcion" rows="3" placeholder="Describe esta muestra"></textarea>
                            </div>
                            <div class="acciones"><button type="button" class="boton-secundario" @click="eliminarMuestra(indice)">Eliminar</button></div>
                        </article>
                        <article v-if="!app.portafolioEdicion.length" class="tarjeta md-card"><p class="meta">Todavia no has subido muestras. Puedes anadir imagenes, audio o video.</p></article>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit">Guardar perfil</button>
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
        async subirFotoPerfil(evento) {
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

            this.app.perfil.fotoPerfil = subida.archivo.url
            evento.target.value = ""
            this.app.mostrarAviso("Foto de perfil subida")
        },
        async guardarPerfil() {
            const datos = await this.app.llamarApi("/api/usuarios/mi-perfil", {
                method: "PUT",
                body: JSON.stringify({ ...this.app.perfil, portafolio: this.app.portafolioEdicion })
            })
            this.app.guardarSesion({ token: this.app.token, usuario: datos.usuario })
            this.app.mostrarAviso("Perfil actualizado")
            await Promise.all([this.app.cargarTalento(), this.app.cargarEmpresasInicio()])
        },
        async subirArchivoPortafolio(evento) {
            const archivo = evento.target.files?.[0]
            if (!archivo) return

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

            this.app.portafolioEdicion.push({
                titulo: archivo.name,
                descripcion: "",
                categoria: "",
                urlMedia: subida.archivo.url,
                urlProyecto: subida.archivo.url
            })

            evento.target.value = ""
            this.app.mostrarAviso("Archivo subido al portfolio")
        },
        eliminarMuestra(indice) {
            this.app.portafolioEdicion.splice(indice, 1)
        }
    }
}
</script>
