const fs = require("fs")
const path = require("path")
const modelosBackup = require("./modelosBackup")

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

function resolverRutaBackup(argumento) {
    if (!argumento) {
        throw new Error("Indica la carpeta del backup. Ejemplo: npm run backup:verificar -- backups/2026-04-30T10-00-00-000Z")
    }

    return path.resolve(process.cwd(), argumento)
}

function verificarBackup() {
    const carpetaBackup = resolverRutaBackup(process.argv[2])
    const rutaDatos = path.join(carpetaBackup, "datos.json")
    const rutaMetadatos = path.join(carpetaBackup, "backup.json")
    const rutaUploads = path.join(carpetaBackup, "uploads")

    if (!fs.existsSync(rutaDatos)) {
        throw new Error("No existe datos.json en el backup indicado")
    }

    if (!fs.existsSync(rutaMetadatos)) {
        throw new Error("No existe backup.json en el backup indicado")
    }

    if (!fs.existsSync(rutaUploads)) {
        throw new Error("No existe la carpeta uploads en el backup indicado")
    }

    const datos = JSON.parse(fs.readFileSync(rutaDatos, "utf8"))
    const metadatos = JSON.parse(fs.readFileSync(rutaMetadatos, "utf8"))
    const resumen = {}

    for (const definicion of modelosBackup) {
        if (!Array.isArray(datos[definicion.nombre])) {
            throw new Error("La coleccion " + definicion.nombre + " no es valida")
        }

        resumen[definicion.nombre] = datos[definicion.nombre].length
    }

    const archivosUploads = contarArchivos(rutaUploads)

    console.log("Backup verificado correctamente:")
    console.log(carpetaBackup)
    console.log(JSON.stringify({
        creadoEn: metadatos.creadoEn,
        colecciones: resumen,
        archivosUploads
    }, null, 2))
}

try {
    verificarBackup()
} catch (error) {
    console.error("Backup no valido:", error.message)
    process.exit(1)
}
