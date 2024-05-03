const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.renderIndex = async (req, res) => {
  const lists = await Listing.find({});
  res.render("listings/index.ejs", { lists });
};

module.exports.renderCreate = (req, res) => {
  res.render("listings/create.ejs");
};

// NO APIKEY

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  let newList = new Listing(req.body.listing);
  newList.owner = req.user._id;
  newList.image = { url, filename };

  // Get the location address from the request
  let address = req.body.listing.location;

  // Use the Nominatim Geocoding service to get the coordinates
  let response = await axios.get(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`
  );

  // Check if the request was successful
  if (response.data && response.data.length > 0) {
    let location = response.data[0];

    // Store the location name and coordinates in the database
    newList.location = {
      name: address,
      geometry: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      },
    };

    await newList.save();
    req.flash("success", "New Listing Created !!");
    res.redirect("/listings");
  } else {
    req.flash(
      "error",
      "No results found, Please recheck location spellings !!"
    );
    res.redirect(`/listings/create`);
  }
};

module.exports.renderUpdate = async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  res.render("listings/update.ejs", { list });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let updateList = await Listing.findById(id);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updateList.image = { url, filename };
  }

  // Get the location address from the request
  let address = req.body.listing.location;

  // Use the Nominatim Geocoding service to get the coordinates
  let response = await axios.get(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`
  );

  // Check if the request was successful
  if (response.data && response.data.length > 0) {
    let location = response.data[0];

    // Update the location name and coordinates in the database
    updateList.location = {
      name: address,
      geometry: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
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

// module.exports.createListing = async (req, res) => {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   let newList = new Listing(req.body.listing);
//   newList.owner = req.user._id;
//   newList.image = { url, filename };
//   await newList.save();
//   req.flash("success", "New Listing Created !!");
//   res.redirect("/listings");
// };
// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;
//   let updateList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     updateList.image = { url, filename };
//     await updateList.save();
//   }
//   req.flash("success", "Listing Updated !!");
//   res.redirect(`/listings/${id}`);
// };

// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;
//   let updateList = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     updateList.image = { url, filename };
//   }

//   // Get the location address from the request
//   let address = req.body.listing.location;

//   // Use the Nominatim Geocoding service to get the coordinates
//   let response = await axios.get(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//       address
//     )}`
//   );

//   // Check if the request was successful
//   if (response.data && response.data.length > 0) {
//     let location = response.data[0];

//     // Update the location name and coordinates in the database
//     updateList.location = {
//       name: address,
//       geometry: {
//         type: "Point",
//         coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
//       },
//     };

//     // Print the updated location name and coordinates in the console
//     console.log(updateList.location);
//   } else {
//     req.flash("error", "No results found, Please recheck location spellings !!");
//     res.redirect(`/listings/${id}/update`)
//   }

//   await updateList.save();
//   req.flash("success", "Listing Updated !!");
//   res.redirect(`/listings/${id}`);
// };

// APIKEY

// module.exports.createListing = async (req, res) => {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   let newList = new Listing(req.body.listing);
//   newList.owner = req.user._id;
//   newList.image = { url, filename };

//   // Get the location address from the request
//   let address = req.body.listing.location;

//   // Use the HERE Geocoding and Search API to get the coordinates
//   let response = await axios.get(
//     `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
//       address
//     )}&apiKey=fyqio2X0BmV56EV3PVY9KEzHjFowKZIuCrsFYXlX99E`
//   );

//   // Check if the request was successful
//   if (response.data.items && response.data.items.length > 0) {
//     let location = response.data.items[0].position;

//     // Store the location name and coordinates in the database
//     newList.location = {
//       name: address,
//       geometry: {
//         type: "Point",
//         coordinates: [location.lng, location.lat],
//       },
//     };

//     // Print the location name and coordinates in the console
//     console.log(newList.location);
//   } else {
//     console.log("Error: No results found");
//   }

//   await newList.save();
//   req.flash("success", "New Listing Created !!");
//   res.redirect("/listings");
// };
