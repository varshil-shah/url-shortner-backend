const router = require("express").Router();
const authController = require("../controllers/auth-controller");
const analyticsController = require("../controllers/analytics-controller");

router.use(authController.protect);

router.route("/").get(analyticsController.getAnalytics);
router.route("/analyse-by-date").get(analyticsController.getAnalyticsByDates);
router.route("/group-by/:group").get(analyticsController.getAnalyticsByGroup);

router.use("/:shortCode", analyticsController.restrictTo);

router.route("/:shortCode").get(analyticsController.getAnalyticsOfShortCode);

module.exports = router;
