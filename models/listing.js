const mongoose = require("mongoose");
const Review = require("./reviews.js");
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
      set: (v) =>
        v === ""
          ? "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg"
          : v,
    },
  },
  price: { type: Number, required: true },
  location: {
    name: { type: String, required: true },
    geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
  },
  country: { type: String, required: true },
  category:{type:String, enum:["moutain, farm, rooms, tranding, city, castle, pool, camping, artic, city, beach, boat, ski"]},
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// delete all related objects
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
