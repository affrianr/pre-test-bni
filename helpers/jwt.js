const jwt = require("jsonwebtoken");
const jwt_secret = process.env.jwt_secret;

const createToken = (payload) => jwt.sign(payload, jwt_secret);
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, jwt_secret);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw { name: "JsonWebTokenError" };
    }
  }
};

module.exports = { createToken, verifyToken };
