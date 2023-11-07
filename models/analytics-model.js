const mongoose = require("mongoose");
const validator = require("validator");

const analyticsSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      trim: true,
      ref: "Shorturl",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    latitude: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      trim: true,
      lowercase: true,
    },
    continent: {
      type: String,
      trim: true,
      lowercase: true,
    },
    platform: {
      type: String,
      trim: true,
      lowercase: true,
    },
    browser: {
      type: String,
      trim: true,
      lowercase: true,
    },
    os: {
      type: String,
      trim: true,
      lowercase: true,
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
