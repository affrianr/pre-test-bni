const { comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const User = require("../models/userModel");

class UserController {
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      const user = await User.create(
        firstName,
        lastName,
        email,
        password,
        phone
      );
      res.status(201).json({
        message: "Account created successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw { name: "login_error" };
      }

      const user = await User.findOne(email);
      if (!user) {
        throw { name: "login_error" };
      }

      const checkPass = comparePassword(password, user.password);
      if (!checkPass) {
        throw { name: "untauhorized" };
      }

      const accessToken = createToken({
        id: user.userId,
        email: user.email,
      });

      res.status(200).json({
        accessToken,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserController;
