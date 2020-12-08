const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  // first param is args, here just destructured
  // userInput comes from schema.js
  createUser: async function({ userInput }, req) {
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
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
  }
};
