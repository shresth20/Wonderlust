const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");

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

// home
app.get("/", (req, res) => {
  res.send("GET request to homepage");
});

// render listings
app.get("/listings", async (req, res) => {
  const lists = await Listing.find({});
  res.render("listings/index.ejs", { lists });
});

// render create new list form
app.get("/listings/new", (req, res) => {
  res.render("listings/create.ejs");
});

// Create new data in db
app.post("/listings/addNew", async (req, res) => {
  let newList = new Listing(req.body.listing);
  await newList
    .save()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  res.redirect("/listings");
});

// render update list form
app.get("/listings/:id/update", async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  res.render("listings/update.ejs", { list });
});

// update data in db
app.put("/listings/addUpdate/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  res.redirect(`/listings/${id}`);
});

// delete data
app.delete("/listings/delete/:id", async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

// render show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  res.render("listings/show.ejs", { list });
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

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
