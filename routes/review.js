const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to get id from app.js(parent router) joint to reviews.js(child router)
const asyncWrap = require("../utils/asyncWrap.js");
const reviewController = require("../controllers/reviews.js");
const {
  validateReview,
  isLoggedIn,
  saveRedirectUrl,
  isReviewAuthor,
} = require("../middleware.js");

// create/post reviews in db
router.post(
  "/",
  isLoggedIn,
  //   validateReview,
  asyncWrap(reviewController.postReview)
);

// delete reviews in db
router.delete(
  "/:reviewId/delete",
  isLoggedIn,
  isReviewAuthor,
  asyncWrap(reviewController.deleteReview)
);

module.exports = router;
