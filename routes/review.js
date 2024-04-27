const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to get id from app.js(parent router) joint to reviews.js(child router)
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const asyncWrap = require("../utils/asyncWrap.js");
const { validateReview, isLoggedIn } = require("../middleware.js");

// add reviews in db
router.post(
  "/",
  //   validateReview,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.reviews);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Thankyou for giving your Review !!");
    res.redirect(`/listings/${id}`);
  })
);

// delete reviews in db
router.delete(
  "/:reviewId/delete",
  asyncWrap(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("info", "Review Deleted !!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
