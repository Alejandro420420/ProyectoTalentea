require("dotenv").config()

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/database")

//const authRoutes = require("./routes/authRoutes")
//const userRoutes = require("./routes/userRoutes")
//const projectRoutes = require("./routes/projectRoutes")
//const applicationRoutes = require("./routes/applicationRoutes")
//const reviewRoutes = require("./routes/reviewRoutes")
const testRoutes = require("./routes/testRoutes")
const app = express()

connectDB()

app.use(cors())
app.use(express.json())

//app.use("/auth", authRoutes)
//app.use("/users", userRoutes)
//app.use("/projects", projectRoutes)
//app.use("/applications", applicationRoutes)
//app.use("/reviews", reviewRoutes)
app.use("/", testRoutes)
app.listen(process.env.PORT, () => {
    console.log("Servidor corriendo en puerto " + process.env.PORT)
})