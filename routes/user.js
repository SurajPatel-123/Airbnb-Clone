const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");

const { saveRedirectUrl } = require("../utils/middleware");
const userController = require("../controller/user");

// ================= SIGNUP =================
router.route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync(userController.SignUp));

// ================= LOGIN =================
router.route("/login")
    .get(userController.renderLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// ================= LOGOUT =================
router.get("/logout", userController.logout);

module.exports = router;