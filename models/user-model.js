const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [30, "Please provide your name within 30 characters."],
    validate: {
      validator: (value) => validator.isAlpa(value),
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
    confirmPassword: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return this.password === value;
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
});

const User = mongoose.Model("User", userSchema);

module.exports = User;
