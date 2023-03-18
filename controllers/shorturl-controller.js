const crc32 = require("crc-32");

const ShortUrl = require("../models/shorturl-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const StatusCode = require("../utils/status-code");

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
