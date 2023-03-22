const mongoose = require("mongoose");
const validator = require("validator");

const analyticsSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: [true, "Please provide a short code."],
      trim: true,
      minlength: [7, "Please provide short url with minimum 7 characters"],
      maxlength: [50, "Maximum 50 characters allowed for short url."],
      ref: "Shorturl",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide owner id of current logged in user."],
      ref: "User",
    },
    city: {
      type: String,
      required: [true, "Please provide a city name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A city should only contain alphabets",
      },
    },
    region: {
      type: String,
      required: [true, "Please provide a region name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A region should only contain alphabets",
      },
    },
    country: {
      type: String,
      required: [true, "Please provide a coutry name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A country should only contain alphabets",
      },
    },
    continent: {
      type: String,
      required: [true, "Please provide a continent name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A continent should only contain alphabets",
      },
    },
    platform: {
      type: String,
      required: [true, "Please provide your platform name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A platform name should only contain alphabets",
      },
    },
    browser: {
      type: String,
      required: [true, "Please provide a browser name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlphanumeric(value, "en-US", { ignore: "/" }),
        message: "A browser name should only contain alphabets",
      },
    },
    os: {
      type: String,
      required: [true, "Please provide an OS name."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "An OS name should only contain alphabets",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;
