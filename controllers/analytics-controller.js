const node_fetch = require("node-fetch");

const Analytics = require("../models/analytics-model");
const ShortUrl = require("../models/shorturl-model");

const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const StatusCode = require("../utils/status-code");
const { extractString, formatDate } = require("../utils/utils");
const APIFeatures = require("../utils/api-features");

exports.restrictTo = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const analyticsInstance = await Analytics.findOne({ shortCode });
  if (!analyticsInstance) {
    return next(
      new AppError("No short url found with this code.", StatusCode.NOT_FOUND)
    );
  } else if (analyticsInstance.ownerId.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "Only owner of this short url has access to this route.",
        StatusCode.FORBIDDEN
      )
    );
  }

  next();
});

exports.storeAnalytics = catchAsync(async (req, res, next) => {
  // Get shortcode from params
  const { shortCode } = req.params;

  // Check if short code exists
  const shortUrlInstance = await ShortUrl.findOne({ shortCode });

  // If not found, send error message
  if (!shortUrlInstance) {
    return next(
      new AppError(
        "Invalid short url! Please provide a valid one.",
        StatusCode.NOT_FOUND
      )
    );
  }

  req.longUrl = shortUrlInstance.longUrl;

  // Get geolocation details
  const response = await node_fetch(
    "http://ip-api.com/json?fields=continent,country,regionName,city,query"
  );
  const data = await response.json();

  // Store log into database
  await Analytics.create({
    shortCode,
    ownerId: shortUrlInstance.userId,
    city: data.city,
    region: data.regionName,
    country: data.country,
    continent: data.continent,
    platform: req.useragent.platform,
    browser: extractString(req.useragent.browser),
    os: extractString(req.useragent.os),
  });

  // Move ahead
  next();
});

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Analytics.find({ ownerId: req.user._id }),
    req.query
  );
  const stats = await features.query;

  res.status(StatusCode.OK).json({
    status: "success",
    results: stats.length,
    data: stats,
  });
});

exports.getAnalyticsByGroup = catchAsync(async (req, res, next) => {
  const { group = "country" } = req.params;
  const { skip = 0, limit = 10 } = req.query;

  const stats = await Analytics.aggregate([
    {
      $match: { ownerId: { $eq: req.user._id } },
    },
    {
      $group: {
        _id: `$${group}`,
        count: { $sum: 1 },
        countries: { $addToSet: "$country" },
        os: { $addToSet: "$os" },
        region: { $addToSet: "$region" },
        city: { $addToSet: "$city" },
      },
    },
    {
      $skip: +skip,
    },
    {
      $limit: +limit,
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  res.status(StatusCode.OK).json({
    status: "success",
    results: stats.length,
    data: stats,
  });
});

exports.getAnalyticsOfShortCode = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const { groupBy = "normal" } = req.query;

  const aggregatePipeline = [
    {
      $match: { shortCode: { $eq: shortCode } },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ];

  // If groupBy is NOT normal, send grouped response
  if (groupBy !== "normal") {
    aggregatePipeline.push({
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        countries: { $addToSet: "$country" },
        os: { $addToSet: "$os" },
        region: { $addToSet: "$region" },
        city: { $addToSet: "$city" },
      },
    });
  }

  const stats = await Analytics.aggregate();

  res.status(StatusCode.OK).json({
    status: "success",
    data: stats,
  });
});

exports.getAnalyticsByDates = catchAsync(async (req, res, next) => {
  const {
    start = formatDate(),
    end = formatDate(1),
    groupBy = "normal",
  } = req.query;

  const aggregatePipeline = [
    {
      $match: {
        ownerId: { $eq: req.user._id },
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ];

  // If groupBy is NOT normal, send grouped response
  if (groupBy !== "normal") {
    aggregatePipeline.push({
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        countries: { $addToSet: "$country" },
        os: { $addToSet: "$os" },
        region: { $addToSet: "$region" },
        city: { $addToSet: "$city" },
      },
    });
  }

  const stats = await Analytics.aggregate(aggregatePipeline);
  res.status(StatusCode.OK).json({
    status: "success",
    results: stats.length,
    data: stats,
  });
});
