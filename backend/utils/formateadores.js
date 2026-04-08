const sanitizarUsuario = (usuario) => {
    if (!usuario) {
        return null
    }

    const fuente = typeof usuario.toObject === "function" ? usuario.toObject() : { ...usuario }
    delete fuente.password

    return fuente
}

module.exports = {
    sanitizarUsuario
}
