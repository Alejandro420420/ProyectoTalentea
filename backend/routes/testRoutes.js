const express = require("express")
const router = express.Router()

const testController = require("../controllers/testController")

router.get("/health", (req, res) => {
    res.json({ status: "OK" })
})

router.post("/test", testController.createTest)

module.exports = router