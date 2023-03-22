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
      minlength: [7, "Please provide short url with minimum 7 characters"],
      maxlength: [50, "Maximum 50 characters allowed for short url."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [50, "Maximum 50 characters allowed for short url."],
    },
    shortUrl: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please provide a short url."],
    },
    longUrl: {
      type: String,
      trim: true,
      required: [true, "Please provide a long url."],
      validate: {
        validator: (value) => validator.isURL(value),
        message: "Please provide a valid long url.",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/*****************************************************/
/* PRE HOOK FOR SHORT URL MODEL */
/*****************************************************/

// Helps to filter inactive urls
shortUrlSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const ShortUrl = mongoose.model("shorturl", shortUrlSchema);

module.exports = ShortUrl;
