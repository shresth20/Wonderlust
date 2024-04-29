const User = require("../models/user.js");

module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupForm = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
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
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginForm = async (req, res) => {
  req.flash(
    "success",
    `Logged in Successfully, Welcome back to Wonderlust !! `
  );
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout Successfully !!");
    res.redirect("/listings");
  });
};
