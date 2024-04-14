const Joi = require("joi");

// Define a custom validation function for URLs
const urlValidation = (value, helpers) => {
  if (!value) {
    return helpers.error("any.required");
  }

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return value;
    } else {
      throw new Error("Invalid URL protocol");
    }
  } catch (err) {
    return helpers.error("any.invalid");
  }
};

const imageSchema = Joi.object({
  filename: Joi.string(),
  url: Joi.string()
    .uri()
    .default(
      "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg"
    )
    .allow("", null),
});

// check validation for listing db schema
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null).optional(),
    // image: Joi.object({
    //         url: Joi.string().optional(),
    //       }).optional(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});


// check validation for review db schema
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(0).max(5),
  }).required(),
});



 