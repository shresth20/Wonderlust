const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const asyncWrap = require("../utils/asyncWrap.js");
const passport = require("passport");
const {isLoggedIn, saveRedirectUrl} = require("../middleware.js")

// redirect signup
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// signup form
router.post(
  "/signup",
  asyncWrap(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wonderlust !!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// redirect login
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// login user form
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "back",
    failureFlash: true,
  }),
  asyncWrap(async (req, res) => {
    req.flash(
      "success",
      `Logged in Successfully, Welcome back to Wonderlust !! `
    );
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  })
);

// logout user
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout Successfully !!");
    res.redirect("/listings");
  });
});

module.exports = router;

// // login form
// router.post(
//   "/login",
//   (req, res, next) => {
//     // Store the current URL in the request object
//     req.returnTo = req.originalUrl;
//     next();
//   },
//   passport.authenticate("local", { failureRedirect: "back", failureFlash: true }),
//   (req, res) => {
//     // Redirect to the stored URL after successful login
//     const returnTo = req.returnTo || "/listings";
//     req.flash("success", "Logged in, Welcome back to Wonderlust !!  @username");
//     res.redirect(returnTo);
//   }
// );
