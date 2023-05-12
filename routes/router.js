

const express = require("express")
const router = express.Router()
const user = require("../controller/user")


router.post("/register", user.create)
router.post("/login", user.login)
router.get("/get", user.get)
module.exports = router