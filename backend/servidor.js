require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const conectarBaseDeDatos = require("./config/baseDeDatos")
const { manejarErrores } = require("./middleware/middlewareErrores")

const rutasAutenticacion = require("./routes/rutasAutenticacion")
const rutasUsuarios = require("./routes/rutasUsuarios")
const rutasProyectos = require("./routes/rutasProyectos")
const rutasCandidaturas = require("./routes/rutasCandidaturas")
const rutasValoraciones = require("./routes/rutasValoraciones")
const rutasAdministracion = require("./routes/rutasAdministracion")

const servidor = express()
const carpetaSubidas = path.join(__dirname, "uploads")

conectarBaseDeDatos()

if (!fs.existsSync(carpetaSubidas)) {
    fs.mkdirSync(carpetaSubidas, { recursive: true })
}

servidor.use(cors())
servidor.use(express.json({ limit: "100mb" }))
servidor.use(express.static(path.join(__dirname, "..", "frontend")))
servidor.use("/uploads", express.static(carpetaSubidas))

servidor.get("/api/salud", (solicitud, respuesta) => {
    respuesta.json({ estado: "OK", servicio: "API Talentea" })
})

servidor.use("/api/autenticacion", rutasAutenticacion)
servidor.use("/api/usuarios", rutasUsuarios)
servidor.use("/api/proyectos", rutasProyectos)
servidor.use("/api/candidaturas", rutasCandidaturas)
servidor.use("/api/valoraciones", rutasValoraciones)
servidor.use("/api/administracion", rutasAdministracion)

servidor.get(/^(?!\/api).*/, (solicitud, respuesta) => {
    respuesta.sendFile(path.join(__dirname, "..", "frontend", "index.html"))
})

servidor.use(manejarErrores)

servidor.listen(process.env.PORT, () => {
    console.log("Servidor corriendo en puerto " + process.env.PORT)
})
