const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const asyncWrap = require("../utils/asyncWrap.js");
const passport = require("passport");

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
      req.flash("success", "Welcome to Wanderlust !!");
      res.redirect("/listings");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// login form
router.post(
  "/login",
  passport.authenticate("local", {failureRedirect:"/listings", failureFlash: true }), 
  asyncWrap(async (req, res) => {
    // let { username, email, password } = req.body;
    // const newUser = new User({ email, username });
    // const registeredUser = await User.register(newUser, password);

    req.flash("success", "Logged in, Welcome back to Wanderlust !!  @username");
    res.redirect("/listings");
  })
); 

module.exports = router;
