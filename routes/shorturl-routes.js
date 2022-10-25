const router = require("express").Router();

const shortUrlController = require("../controllers/shorturl-controller");
const authController = require("../controllers/auth-controller");

router.use(authController.protect);

router.route("/").post(shortUrlController.createShortUrl);

module.exports = router;
