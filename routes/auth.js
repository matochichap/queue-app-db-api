const express = require("express")
const bcrypt = require("bcrypt")
const router = express.Router()
const User = require("../models/user")
const LocalStrategy = require("passport-local").Strategy
const passport = require("passport")

function initPassport(passport) {
    async function getUserById(id) {
        try {
            const user = await User.findById(id)
            return user
        } catch {
            return null
        }
    }
    
    async function getUserByEmail(email) {
        try {
            return await User.findOne({email: email})
        } catch {
            return null
        }
    }

    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: "No user found" })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: "Incorrect password" })
            }
        } catch (err) {
            return done(err)
        }
    }
    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => done(null, getUserById(id)))
}

initPassport(passport)

router.get("/login", checkNotAuth, (req, res) => {
    res.render("login.ejs")
})

router.post("/login", checkNotAuth, passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/login",
    failureFlash: true
}))

router.get("/register", checkNotAuth, (req, res) => {
    res.render("register.ejs")
})

router.post("/register", checkNotAuth, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email
        })
        try {
            await user.save()
        } catch (err) {
            req.flash("err", err.message)
            return res.render("register.ejs", { messages: req.flash() })
            // res.status(400).json({message: err.message})
        }
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
})

router.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        }
        res.redirect('/login')
    })
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users")
    }
    next()
}

module.exports = {
    authRouter: router,
    checkAuth: checkAuth
}