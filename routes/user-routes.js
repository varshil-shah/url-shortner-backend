const router = require("express").Router();

const authController = require("../controllers/auth-controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch(
  "/update-my-password",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
