const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [30, "Please provide your name within 30 characters."],
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "A name should only contain Alphabets",
      },
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "Please provide your email address."],
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "Please provide a password with minimum length 8."],
      required: [true, "Please provide your password."],
      select: false,
      validate: {
        validator: (value) => validator.isStrongPassword(value),
        message:
          "A password must contain 8 character, 1 uppercase, 1 lowercase and 1 special character",
      },
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password."],
      trim: true,
      validate: {
        // THIS ONLY WORKS ON CREATE or SAVE!!
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords are not matching.",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

/*****************************************************/
/* PRE HOOK FOR USER MODEL */
/*****************************************************/

// To check whether password is changed or not
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Helps to hash the password
userSchema.pre("save", async function (next) {
  // If password is not modified, return
  if (!this.isModified("password")) return next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);

  // Remove confirm password
  this.confirmPassword = undefined;

  next();
});

// Helps to filter inactive users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
