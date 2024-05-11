const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.renderIndex = async (req, res) => {
  const lists = await Listing.find({});
  res.render("listings/index.ejs", { lists });
};

module.exports.renderCreate = (req, res) => {
  res.render("listings/create.ejs");
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  let newList = new Listing(req.body.listing);
  newList.owner = req.user._id;
  newList.image = { url, filename };

  // Get the location address from the request
  let address = req.body.listing.location;

  // Use the HERE Geocoding and Search API to get the coordinates
  let response = await axios.get(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      address
    )}&apiKey=fyqio2X0BmV56EV3PVY9KEzHjFowKZIuCrsFYXlX99E`
  );

  // Check if the request was successful
  if (response.data.items && response.data.items.length > 0) {
    let location = response.data.items[0].position;

    // Store the location name and coordinates in the database
    newList.location = {
      name: address,
      geometry: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    };

    // check the location name and coordinates in the console
    // console.log(newList.location);
  } else {
    req.flash("error", "Location: No results found");
  }
  await newList.save();
  req.flash("success", "New Listing Created !!");
  res.redirect("/listings");
};

// update
module.exports.renderUpdate = async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  res.render("listings/update.ejs", { list });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let updateList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updateList.image = { url, filename };
  }
  // Get the location address from the request
  let address = req.body.listing.location;

  // Use the HERE Geocoding service to get the coordinates
  let response = await axios.get(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      address
    )}&apiKey=fyqio2X0BmV56EV3PVY9KEzHjFowKZIuCrsFYXlX99E`
  );

  // Check if the request was successful
  if (response.data && response.data.items && response.data.items.length > 0) {
    let location = response.data.items[0].position;

    // Update the location name and coordinates in the database
    updateList.location = {
      name: address,
      geometry: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    };

    // Save the updated listing
    await updateList.save();
    req.flash("success", "Listing Updated !!");
    res.redirect(`/listings/${id}`);
  } else {
    req.flash(
      "error",
      "No results found, Please recheck location spellings !!"
    );
    res.redirect(`/listings/${id}/update`);
  }
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted !!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!list) {
    req.flash("error", "Requested Listing does't exist !!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { list });
};

module.exports.searchListings = async (req, res) => {
  try {
    let query = {};
    if (req.query.location) {
      const firstWord = req.query.location.split(" ")[0];
      query["location.name"] = new RegExp("^" + firstWord + "\\b", "i");

      const lists = await Listing.find(query).sort({ "location.name": 1 });
      if (lists.length > 0) {
        res.render("listings/index.ejs", { lists });
      } else {
        req.flash("error", "Location not found or Please recheck spellings");
        res.redirect("/listings");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.filterListings = async (req, res) => {
  try {
    const category = iconToCategory[req.params.icon];
    const lists = await Listing.find({ category }).sort({ category: 1 });
    if (lists.length > 0) {
      res.render("listings/index.ejs", { lists });
    } else {
      req.flash("error", "No listings found for this category");
      res.redirect("/listings");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// if (req.body.location === null || req.body.location.trim() === '') {
//   req.flash('error', 'No location provided');
//   return res.redirect('/listings');
// }
// let query = {};
// if (req.body.location !== null) {
//   if (req.body.location) {
//     const firstWord = req.body.location.split(" ")[0];
//     query["location.name"] = new RegExp("^" + firstWord + "\\b", "i");
//   }

// try {
//   let query = {};
//   if (req.body.location) {
//     query["location.name"] = new RegExp("^" + req.body.location + "$", "i");
//   }
//   console.log(req.body.location);
//   const lists = await Listing.find(query).sort({ "location.name": 1 });
//   res.render("listings/index.ejs", { lists });
// } catch (err) {
//   console.error(err);
//   res.status(500).send("Server Error");
// }

// try {
//   let query = {};
//   if (req.query.location) {
//     query["location.name"] = new RegExp('^' + req.query.location + '$', 'i');
//   }
//   if (req.query.country) {
//     query["country"] = new RegExp('^' + req.query.country + '$', 'i');
//   }
//   const lists = await Listing.find(query).sort({
//     "location.name": 1,
//     country: 1,
//   });
//   res.render("listings/index.ejs", { lists });
// } catch (err) {
//   console.error(err);
//   res.status(500).send("Server Error");
// }

// console.log("searched", req.query);
// try {
//   let query = {};
//   if (req.query.location) {
//     query["location.name"] = req.query.location;
//   }
//   if (req.query.country) {
//     query["country"] = req.query.country;
//   }
//   const lists = await Listing.find(query).sort({
//     "location.name": 1,
//     country: 1,
//   });
//   res.render("listings/index.ejs", { lists });
// } catch (err) {
//   console.error(err);
//   res.status(500).send("Server Error");
// }
