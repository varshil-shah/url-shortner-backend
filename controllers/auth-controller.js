const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const StatusCode = require("../utils/status-code");

/**
 * Generated a token based on provided id.
 * @param {String} id
 * @returns {String}
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  });

/**
 * Create and send new token to user
 * @param {mongoose.Document} user
 * @param {Number} statusCode
 * @param {express.Response} res
 */
const createAndSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  const token = signToken(user._id);

  // Set cookie
  res.cookie("jwt", token, cookieOptions);

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: "user",
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createAndSendToken(user, StatusCode.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Fetch email and password from req.body
  const { email, password } = req.body;

  // Check if both are not null
  if (!email || !password) {
    return next(
      new AppError(
        "Please provide both email and password",
        StatusCode.BAD_REQUEST
      )
    );
  }

  // Check if the user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(
      new AppError(
        "Email doesn't exists or password is incorrect!",
        StatusCode.UNAUTHORIZED
      )
    );
  }

  // If everything goes well, send token and user details
  createAndSendToken(user, StatusCode.OK, res);
});
