const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: { type: String },
    userName: { type: String },
    email: { type: String },
    password: { type: String },
}, { timestamp: true })
module.exports = mongoose.model("user", userSchema)