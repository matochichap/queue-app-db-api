const mongoose = require("mongoose")
const dbName = "users"

// use createConnection instead of connect to connect to multiple db at once
const db = mongoose.createConnection(`${process.env.DATABASE_URL}/${dbName}`)
db.on("error", error => console.error(error))
db.once("open", () => console.log(`Connected to ${dbName}`))
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = db.model("user", userSchema)