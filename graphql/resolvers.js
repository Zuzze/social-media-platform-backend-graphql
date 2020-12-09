const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

module.exports = {
  // first param is args, here just destructured
  // userInput comes from schema.js
  createUser: async function({ userInput }, req) {
    // server-side validation
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Email formatting is invalid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password must be at least 5 characters" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    // Data valid, create user and hash password
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword
    });
    const createdUser = await user.save();
    // this format is defined in schema `User`
    // _id is ObjectId in mongo by default so have to convert it to string to work with it in js
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function({ email, password }) {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("User not found");
      error.code = 401;
      throw error;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("Password is incorrect");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  }
};
