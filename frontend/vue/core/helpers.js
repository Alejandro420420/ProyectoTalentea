window.TalenteaHelpers = {
    esRolUsuario(usuario) {
        return usuario?.rol === "usuario" || usuario?.rol === "creativo"
    },
    obtenerTextoRol(rol) {
        return rol === "creativo" ? "usuario" : rol || ""
    },
    obtenerIniciales(texto = "") {
        return texto
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) => parte[0]?.toUpperCase() || "")
            .join("")
    },
    renderizarAvatarHtml(entidad, nombreAlternativo = "Perfil") {
        const nombre = entidad?.nombreEmpresa || entidad?.nombre || nombreAlternativo
        if (entidad?.fotoPerfil) {
            return `<img class="foto-perfil" src="${entidad.fotoPerfil}" alt="${nombre}" />`
        }
        return `<div class="foto-placeholder">${this.obtenerIniciales(nombre)}</div>`
    },
    obtenerTipoMedia(url = "") {
        const normalizada = url.toLowerCase()
        if (/\.(jpg|jpeg|png|gif|webp)$/.test(normalizada)) return "imagen"
        if (normalizada.endsWith(".mp3")) return "audio"
        if (normalizada.endsWith(".mp4")) return "video"
        return "enlace"
    },
    renderizarMediaHtml(elemento) {
        const url = elemento.urlMedia || elemento.urlProyecto || ""
        const tipo = this.obtenerTipoMedia(url)
        if (tipo === "imagen") return `<img class="preview-portafolio" src="${url}" alt="${elemento.titulo || "Muestra"}" />`
        if (tipo === "audio") return `<audio class="preview-audio" controls src="${url}"></audio>`
        if (tipo === "video") return `<video class="preview-video" controls src="${url}"></video>`
        return `<a class="enlace-portafolio" href="${url}" target="_blank" rel="noreferrer">Abrir muestra</a>`
    },
    iconoGrupo(tipo) {
        const iconos = {
            home: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
            user: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
            briefcase: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7m-9 0h10.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-8A2.5 2.5 0 0 1 6.5 7H7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.8"/></svg>',
            shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
        }
        return iconos[tipo] || ""
    }
}
