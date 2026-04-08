require("dotenv").config()

const mongoose = require("mongoose")
const conectarBaseDeDatos = require("../config/baseDeDatos")
const Usuario = require("../models/Usuario")

const crearAdministrador = async () => {
    await conectarBaseDeDatos()

    const email = process.env.ADMIN_EMAIL || "admin@talentea.local"
    const password = process.env.ADMIN_PASSWORD || "Admin1234"

    const administradorExistente = await Usuario.findOne({ email })
    if (administradorExistente) {
        console.log(`Ya existe un administrador con el email ${email}`)
        await mongoose.connection.close()
        return
    }

    await Usuario.create({
        nombre: "Administrador Talentea",
        email,
        password,
        rol: "admin",
        verificado: true
    })

    console.log(`Administrador creado: ${email}`)
    console.log(`Contrasena: ${password}`)
    await mongoose.connection.close()
}

crearAdministrador().catch(async (error) => {
    console.error("No se pudo crear el administrador", error)
    await mongoose.connection.close()
    process.exit(1)
})
