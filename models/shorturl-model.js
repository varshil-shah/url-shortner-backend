const mongoose = require("mongoose");
const validator = require("validator");

const shortUrlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide user Id."],
      ref: "User",
    },
    shortCode: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please provide short code."],
      minlength: [8, "Please provide short url with minimum 8 characters"],
      maxlength: [50, "Maximum 50 characters allowed for short url."],
    },
    longUrl: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please provide a long url."],
      validate: {
        validator: (value) => validator.isURL(value),
        message: "Please provide a valid url.",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const ShortUrl = mongoose.model("shorturl", shortUrlSchema);

module.exports = ShortUrl;
