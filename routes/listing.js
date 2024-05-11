const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const listingController = require("../controllers/listings.js");
const { validateListing, isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  // render home
  .get(asyncWrap(listingController.renderIndex));

router
  .route("/create")
  // render create new list form
  .get(isLoggedIn, listingController.renderCreate)
  // Create listings in db
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    // validateListing,
    asyncWrap(listingController.createListing)
  )
  .post(upload.single("listing[image]"), (req, res) => {
    res.send(req.file);
  });

router
  .route("/:id/update")
  // render update list form
  .get(isLoggedIn, isOwner, asyncWrap(listingController.renderUpdate))
  // update data in db
  .put(
    isOwner,
    upload.single("listing[image]"),
    // validateListing,
    asyncWrap(listingController.updateListing)
  );

router.route("/search").get(asyncWrap(listingController.searchListings));
router.route("/filter").get(asyncWrap(listingController.filterListings));

router
  .route("/:id")
  // render show route
  .get(asyncWrap(listingController.showListing))
  // delete listing data in db
  .delete(isLoggedIn, isOwner, asyncWrap(listingController.deleteListing));

module.exports = router;
