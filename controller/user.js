const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};
module.exports.SignUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({
            email,
            username,
            password   // ✅ plain password
        });
        const savedUser = await newUser.save();
        console.log(savedUser);
        req.login(savedUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!, You are logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);   // 🔥 ADD THIS
}
module.exports.logout = async (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "You are Logged out!");
        res.redirect("/listings");
    });
}