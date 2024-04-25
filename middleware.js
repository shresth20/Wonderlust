module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to create listings");
    // res.render("listings/listing.ejs", { clickLoginButton: true });
    // return res.redirect("/listings");
  }
  next();
};
