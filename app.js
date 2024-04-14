const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ejsMate = require("ejs-mate");
const asyncWrap = require("./utils/asyncWrap.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

main = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
};

main()
  .then((res) => console.log("Connection Successfull"))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// fn to check validation for listing db schema
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// fn to check validation for reviews db schema
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// home
app.get("/", (req, res) => {
  res.send("GET request to homepage");
});

// render listings
app.get(
  "/listings",
  asyncWrap(async (req, res) => {
    const lists = await Listing.find({});
    res.render("listings/index.ejs", { lists });
  })
);

// render create new list form
app.get("/listings/new", (req, res) => {
  res.render("listings/create.ejs");
});

// Create listings in db
app.post(
  "/listings/addNew",
  // validateListing,
  asyncWrap(async (req, res) => {
    let newList = new Listing(req.body.listing);
    await newList
      .save()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    res.redirect("/listings");
  })
);

// render update list form
app.get(
  "/listings/:id/update",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id);
    res.render("listings/update.ejs", { list });
  })
);

// update data in db
app.put(
  "/listings/addUpdate/:id",
  // validateListing,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    res.redirect(`/listings/${id}`);
  })
);

// delete listing data in db
app.delete(
  "/listings/delete/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

// add reviews in db
app.post(
  "/listings/:id/reviews",
  // validateReview,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.reviews);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
  })
);

// render show route
app.get(
  "/listings/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { list });
  })
);

// delete reviews in db
app.delete(
  "/listings/:id/reviews/:reviewId/delete",
  asyncWrap(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

// next all error to middleware
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found !!"));
});

// return error status and message
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Somthing Went Wrong !!" } = err;
  // res.status(statusCode).send(message);
  res.render("error.ejs", { statusCode, message });
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});

// test data listing
// app.get("/test", async (req, res) => {
//   let sampleListings = new Listing ({
//     title: "New villa",
//     description:
//       "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
//     image: {
//       filename: "listingimage",
//       url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
//     },
//     price: 1500,
//     location: "Malibu",
//     country: "United States",
//   })
//   await sampleListings.save()
//   console.log("saved")
//   res.send("Data saved");
// });

// // check token for authenticate
// app.use("/admin", (req, res, next) => {
//   let { token } = req.query;
//   if (token == "54321") {
//     console.log("Right token key");
//     next();
//   }
//   // throw new Error(403, "ACCESS DENIDED !!");
//   res.send("ACCESS DENIDED !!");
// });

// app.get("/admin", (req, res) => {
//   res.send("This is Admin page");
// });
