require("dotenv").config()

const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")
const modelosBackup = require("./modelosBackup")

const raizBackend = path.join(__dirname, "..")
const carpetaBackups = path.join(raizBackend, "backups")
const carpetaUploads = path.join(raizBackend, "uploads")

function fechaParaCarpeta() {
    return new Date().toISOString().replace(/[:.]/g, "-")
}

function contarArchivos(carpeta) {
    if (!fs.existsSync(carpeta)) {
        return 0
    }

    return fs.readdirSync(carpeta, { withFileTypes: true }).reduce((total, entrada) => {
        const rutaEntrada = path.join(carpeta, entrada.name)

        if (entrada.isDirectory()) {
            return total + contarArchivos(rutaEntrada)
        }

        return total + 1
    }, 0)
}

async function crearBackup() {
    if (!process.env.MONGO_URI) {
        throw new Error("Falta MONGO_URI en .env")
    }

    const carpetaBackup = path.join(carpetaBackups, fechaParaCarpeta())
    const carpetaUploadsBackup = path.join(carpetaBackup, "uploads")
    const datos = {}
    const resumen = {}

    fs.mkdirSync(carpetaBackup, { recursive: true })

    await mongoose.connect(process.env.MONGO_URI)

    for (const definicion of modelosBackup) {
        datos[definicion.nombre] = await definicion.consulta()
        resumen[definicion.nombre] = datos[definicion.nombre].length
    }

    fs.writeFileSync(
        path.join(carpetaBackup, "datos.json"),
        JSON.stringify(datos, null, 2)
    )

    if (fs.existsSync(carpetaUploads)) {
        fs.cpSync(carpetaUploads, carpetaUploadsBackup, { recursive: true })
    } else {
        fs.mkdirSync(carpetaUploadsBackup, { recursive: true })
    }

    const metadatos = {
        creadoEn: new Date().toISOString(),
        baseDeDatos: mongoose.connection.name,
        colecciones: resumen,
        archivosUploads: contarArchivos(carpetaUploadsBackup)
    }

    fs.writeFileSync(
        path.join(carpetaBackup, "backup.json"),
        JSON.stringify(metadatos, null, 2)
    )

    await mongoose.disconnect()

    console.log("Backup creado correctamente:")
    console.log(carpetaBackup)
    console.log(JSON.stringify(metadatos, null, 2))
}

crearBackup().catch(async (error) => {
    console.error("No se pudo crear el backup:", error.message)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
})
