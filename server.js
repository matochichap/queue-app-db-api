require('dotenv').config()

const express = require("express")
const app = express()

const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

// routes
const usersRouter = require("./routes/users")
const {authRouter, checkAuth} = require("./routes/auth")

app.set("view-engine", "ejs")

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

app.use("/users", checkAuth, usersRouter)
app.use("/", authRouter)

app.listen(3000, () => console.log("Server Started"))