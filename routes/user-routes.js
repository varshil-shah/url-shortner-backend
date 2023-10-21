const router = require("express").Router();

const authController = require("../controllers/auth-controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/github", authController.githubAuth);
router.get(
  "/github/callback",
  authController.githubAuthCallback,
  authController.storeGithubUser
);

router.patch(
  "/update-my-password",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
