<template>
    <section class="view-page">
        <div class="view-header">
            <div>
                <p class="etiqueta">Resumen</p>
                <h1>Haz que pase con Talentea</h1>
            </div>
        </div>

        <section class="panel seccion-panel md-card">
            <section class="hero-inicio hero-inicio-infojobs">
                <div class="hero-texto">
                    <span class="etiqueta-hero">Bolsa de talento creativo</span>
                    <h4>Encuentra proyectos, empresas y perfiles preparados para crear</h4>
                    <p>Talentea funciona como una plataforma especializada para perfiles artisticos y empresas que necesitan talento con portfolio, estilo propio y experiencia visible.</p>
                    <div class="hero-puntos"><span>Publica proyectos</span><span>Descubre talento</span><span>Valora colaboraciones</span></div>
                </div>
                <div class="hero-estadisticas hero-columnas">
                    <article class="mini-panel mini-panel-destacado"><p class="etiqueta">Empresas activas</p><h4>Sellos, estudios, agencias, marcas y productoras</h4><p>Espacios donde un portfolio creativo tiene mas peso que un curriculum tradicional.</p></article>
                    <article class="mini-panel"><p class="etiqueta">Perfiles top</p><h4>Diseno, musica, fotografia, video y contenido</h4><p>Talento recomendado para proyectos visuales, sonoros y digitales.</p></article>
                </div>
            </section>
        </section>

        <section class="rejilla-mercado top-gap">
            <article class="mini-panel bloque-listado md-card">
                <div class="view-subheader"><div><p class="etiqueta">Empresas ejemplo</p><h3>Quien podria contratar aqui</h3></div></div>
                <div class="lista-simple">
                    <template v-if="app.empresasInicio.length">
                        <article v-for="empresa in app.empresasInicio.slice(0, 4)" :key="empresa._id" class="empresa-inicio">
                            <div class="empresa-inicio-logo" v-html="app.renderizarAvatarHtml(empresa, empresa.nombreEmpresa || empresa.nombre)"></div>
                            <p class="empresa-inicio-nombre">{{ empresa.nombreEmpresa || empresa.nombre }}</p>
                        </article>
                    </template>
                    <span v-else class="empresa-inicio-vacio">Sin empresas registradas todavia</span>
                </div>
            </article>
            <article class="mini-panel bloque-listado md-card">
                <div class="view-subheader"><div><p class="etiqueta">Bolsa de usuarios</p><h3>Perfiles recomendados</h3></div></div>
                <div class="lista-simple"><span>Disenador grafico</span><span>Productor musical</span><span>Editor de video</span><span>Fotografo creativo</span><span>Ilustrador digital</span><span>Motion designer</span></div>
            </article>
            <article class="mini-panel bloque-listado md-card">
                <div class="view-subheader"><div><p class="etiqueta">Categorias</p><h3>Especialidades destacadas</h3></div></div>
                <div class="lista-categorias"><span>Branding</span><span>Produccion musical</span><span>Montaje audiovisual</span><span>Fotografia</span><span>Arte digital</span><span>Contenido para redes</span><span>Diseno editorial</span><span>Postproduccion</span></div>
            </article>
        </section>
    </section>
</template>

<script>
export default {
    props: {
        app: { type: Object, required: true }
    }
}
</script>
