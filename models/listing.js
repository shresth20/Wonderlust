const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    filename: { type: String },
    url: {
      type: String,
      default:
        "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg",
    },
  },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

// set: (v) =>
//   v === ""
//     ? "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg"
//     : v,
