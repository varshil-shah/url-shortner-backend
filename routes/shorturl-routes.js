const router = require("express").Router();

const shortUrlController = require("../controllers/shorturl-controller");
const authController = require("../controllers/auth-controller");
const analyticsController = require("../controllers/analytics-controller");

router.get(
  "/s/:shortCode",
  analyticsController.storeAnalytics,
  shortUrlController.redirectShortUrl
);

router.use(authController.protect);

router.route("/").post(shortUrlController.createShortUrl);

module.exports = router;
