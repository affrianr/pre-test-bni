const bcrypt = require("bcryptjs");

const hashPassword = (inputPassword) => bcrypt.hashSync(inputPassword, 10);
const comparePassword = (inputPassword, hashedPassword) =>
  bcrypt.compareSync(inputPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };
