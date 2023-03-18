const crc32 = require("crc-32");

const ShortUrl = require("../models/shorturl-model");
const AppError = require("../utils/app-error");
const Analytics = require("../models/analytics-model");

const catchAsync = require("../utils/catch-async");
const StatusCode = require("../utils/status-code");

exports.restrictDeleteShortUrl = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const shortUrlInstance = await ShortUrl.findOne({
    shortCode,
    userId: req.user._id,
  });

  if (!shortUrlInstance) {
    return next(
      new AppError("No url found with this short code.", StatusCode.NOT_FOUND)
    );
  } else if (shortUrlInstance.userId !== req.user._id) {
    return next(
      new AppError(
        "You don't have access to delete this url.",
        StatusCode.FORBIDDEN
      )
    );
  }

  next();
});

exports.createShortUrl = catchAsync(async (req, res, next) => {
  // Get url from req.body
  const { longUrl } = req.body;

  // Check if long url exists in req.body
  if (!longUrl) {
    return next(
      new AppError("Please provide a long url.", StatusCode.BAD_REQUEST)
    );
  }

  // Generate short code combining userId + longUrl
  const shortCode = crc32
    .buf(Buffer.from(`${req.user._id}-${longUrl}`, "binary"), 0)
    .toString(16);

  // Store into database
  const shortUrlInstance = await ShortUrl.create({
    userId: req.user._id,
    shortCode,
    longUrl,
  });

  const shortUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/shorturls/s/${shortCode}`;

  // Send short url
  res.status(StatusCode.CREATED).json({
    status: "success",
    data: {
      shortUrl,
      ...shortUrlInstance.toObject(),
    },
  });
});

exports.redirectShortUrl = catchAsync(async (req, res, next) => {
  // Redirect user
  res.status(StatusCode.MOVED_TEMPORARILY).redirect(req.longUrl);
});

// Update the status of shorturl from active to inactive
exports.deleteShortUrl = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const shortUrlInstance = await ShortUrl.findOneAndDelete({ shortCode });

  if (!shortUrlInstance) {
    return next(
      new AppError(
        "No short url found with that short code.",
        StatusCode.NOT_FOUND
      )
    );
  }

  const analyticsInstance = await Analytics.deleteMany({ shortCode });
  if (!analyticsInstance) {
    return next(
      new AppError(
        "Something went wrong while delete analytics log.",
        StatusCode.NOT_FOUND
      )
    );
  }

  res.status(StatusCode.NO_CONTENT).json({
    status: "success",
    data: null,
  });
});
