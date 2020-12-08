const express = require("express");
const { body } = require("express-validator/check");

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

/*
https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH: 
An idempotent operation is an operation, action, or request that can be
applied multiple times without changing the result.

A PATCH is not necessarily idempotent, although it can be. 
Contrast this with PUT; which is always idempotent. For example 
if an auto-incrementing counter field is an integral part of the 
resource, then a PUT will naturally overwrite it (since it overwrites
everything), but not necessarily so for PATCH.
*/
router.patch(
  "/status",
  isAuth,
  [
    body("status")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;
