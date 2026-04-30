require("dotenv").config()

const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")
const modelosBackup = require("./modelosBackup")

const raizBackend = path.join(__dirname, "..")
const carpetaUploads = path.join(raizBackend, "uploads")

function resolverRutaBackup(argumento) {
    if (!argumento) {
        throw new Error("Indica la carpeta del backup. Ejemplo: npm run backup:restaurar -- backups/2026-04-30T10-00-00-000Z --confirmar")
    }

    return path.resolve(process.cwd(), argumento)
}

function leerDatosBackup(carpetaBackup) {
    const rutaDatos = path.join(carpetaBackup, "datos.json")

    if (!fs.existsSync(rutaDatos)) {
        throw new Error("No existe datos.json en el backup indicado")
    }

    const datos = JSON.parse(fs.readFileSync(rutaDatos, "utf8"))

    for (const definicion of modelosBackup) {
        if (!Array.isArray(datos[definicion.nombre])) {
            throw new Error("La coleccion " + definicion.nombre + " no es valida")
        }
    }

    return datos
}

async function restaurarBackup() {
    if (!process.argv.includes("--confirmar")) {
        throw new Error("Restauracion cancelada. Anade --confirmar para reemplazar los datos actuales.")
    }

    if (!process.env.MONGO_URI) {
        throw new Error("Falta MONGO_URI en .env")
    }

    const carpetaBackup = resolverRutaBackup(process.argv[2])
    const carpetaUploadsBackup = path.join(carpetaBackup, "uploads")
    const datos = leerDatosBackup(carpetaBackup)

    if (!fs.existsSync(carpetaUploadsBackup)) {
        throw new Error("No existe la carpeta uploads en el backup indicado")
    }

    await mongoose.connect(process.env.MONGO_URI)

    for (const definicion of modelosBackup) {
        await definicion.modelo.deleteMany({})

        if (datos[definicion.nombre].length > 0) {
            await definicion.modelo.insertMany(datos[definicion.nombre], { ordered: true })
        }
    }

    fs.rmSync(carpetaUploads, { recursive: true, force: true })
    fs.cpSync(carpetaUploadsBackup, carpetaUploads, { recursive: true })

    await mongoose.disconnect()

    console.log("Backup restaurado correctamente desde:")
    console.log(carpetaBackup)
}

restaurarBackup().catch(async (error) => {
    console.error("No se pudo restaurar el backup:", error.message)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
})
