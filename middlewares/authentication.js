const { verifyToken } = require("../helpers/jwt");
const User = require("../models/userModel");

const authentication = async (req, res, next) => {
  try {
    //cek apakah request membawa token
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      throw { name: "unauthorized" };
    }

    //split bearer token dan mengambil token saja
    const token = bearerToken.split(" ")[1];

    // verify token menggunakan jwt verifier
    const verified = await verifyToken(token);
    const userFound = await User.findById(verified.id);

    if (!userFound) {
      throw { name: "unauthorized" };
    }

    console.log("masuk auth");
    req.user = {
      id: userFound.userId,
      email: userFound.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
