const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../utils/middleware");
const userController=require("../controller/user");

router.route("/signup")
.get( userController.renderSignup)
.post( wrapAsync(userController.SignUp));

router.route("/login")
.get(userController.renderLogin)

router.post("/login", saveRedirectUrl, (req, res, next) => {
passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true,
}),
userController.login
next();
}
);

router.get("/logout",userController.logout)


module.exports = router;