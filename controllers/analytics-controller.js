const node_fetch = require("node-fetch");

const Analytics = require("../models/analytics-model");
const ShortUrl = require("../models/shorturl-model");

const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const StatusCode = require("../utils/status-code");
const { extractString } = require("../utils/utils");

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
    ip: data.query,
    city: data.city,
    region: data.regionName,
    country: data.country,
    continent: data.continent,
    platform: req.useragent.platform,
    browser: extractString(req.useragent.browser),
    os: extractString(req.useragent.os),
  });

  // Increment the clicks counter
  shortUrlInstance.clicks++;
  await shortUrlInstance.save();

  // Move ahead
  next();
});
