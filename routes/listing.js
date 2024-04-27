const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const asyncWrap = require("../utils/asyncWrap.js");
const {validateListing, isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");



// render home
router.get(
  "/",
  asyncWrap(async (req, res) => {
    const lists = await Listing.find({});
    res.render("listings/index.ejs", { lists });
  })
);

// render create new list form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/create.ejs");
});

// Create listings in db
router.post(
  "/addNew",
  // validateListing,
  asyncWrap(async (req, res) => {
    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    await newList.save();
    req.flash("success", "New Listing Created !!");
    res.redirect("/listings");
  })
);

// render update list form
router.get(
  "/:id/update",
  isLoggedIn,
  isOwner,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id);
    res.render("listings/update.ejs", { list });
  })
);

// update data in db
router.put(
  "/addUpdate/:id",
  isOwner,
  // validateListing,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated !!");
    res.redirect(`/listings/${id}`);
  })
);

// delete listing data in db
router.delete(
  "/delete/:id",
  isLoggedIn,
  isOwner,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted !!");
    res.redirect("/listings");
  })
);

// render show route
router.get(
  "/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!list) {
      req.flash("error", "Requested Listing does't exist !!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
  })
);

module.exports = router;
