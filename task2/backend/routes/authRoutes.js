const express = require("express");
const {
  registerController,
  loginController,
  getAllUserController,
} = require("../controllers/authController");
const router = express.Router();
const { body } = require("express-validator");

//? ROUTE: REGISTER
router.post(
  "/register",
  [
    body("name", "Please enter a valid name").exists(),
    body("password", "Password must be of 8 characters long")
      .exists()
      .isLength({ min: 8 }),
    body("email", "Please enter a valid email").exists().isEmail(),
  ],
  registerController
);

//? ROUTE: LOGIN
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").exists().isEmail(),
    body("password", "Password must be of 8 characters long")
      .exists()
      .isLength({ min: 8 }),
  ],
  loginController
);

router.get("/get-users", getAllUserController);
module.exports = router;
