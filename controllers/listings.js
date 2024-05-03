const Listing = require("../models/listing.js");

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
  await newList.save();
  req.flash("success", "New Listing Created !!");
  res.redirect("/listings");
};

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
    await updateList.save();
  }
  req.flash("success", "Listing Updated !!");
  res.redirect(`/listings/${id}`);
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

