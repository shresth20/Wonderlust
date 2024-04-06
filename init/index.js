const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const main = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
    console.log("Connection Successful");

    await initDB(); // Call initDB function here
  } catch (err) {
    console.error("Connection error:", err);
  }
};

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Data is initialized");
  } catch (err) {
    console.error("Initialization error:", err);
  }
};

main();
