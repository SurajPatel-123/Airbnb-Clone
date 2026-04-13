const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ================= SIGNUP PAGE =================
module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

// ================= SIGNUP =================
module.exports.SignUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // basic validation
        if (!username || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect("/signup");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            email,
            username,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        req.login(savedUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

// ================= LOGIN PAGE =================
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

// ================= LOGIN =================
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust! You are logged in");

    const redirectUrl = res.locals.redirectUrl || "/listings";

    return res.redirect(redirectUrl);
};

// ================= LOGOUT =================
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "You are logged out!");
        return res.redirect("/listings");
    });
};