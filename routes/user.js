const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const passport = require("passport");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  // render signup
  .get(userController.renderSignup)
  // signup form
  .post(asyncWrap(userController.signupForm));

router
  .route("/login")
  // render login
  .get(userController.renderLogin)
  // login user form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "back",
      failureFlash: true,
    }),
    asyncWrap(userController.loginForm)
  );

// logout user
router.get("/logout", userController.logoutUser);

module.exports = router;
