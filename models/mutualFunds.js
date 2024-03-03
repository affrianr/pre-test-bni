const pool = require("../config/connection");

class Model {
  static async findAll() {
    try {
      let query = `
            SELECT * FROM "MutualFunds"
        `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  static async create(fundName, nav, company) {
    try {
      let query = `
            INSERT INTO "MutualFunds" ("fundName", nav, company)
            VALUE ($1, $2, $3)
            RETUNRING *
        `;
      const { rows } = await pool.query(query, [fundName, nav, company]);
      return rows[0];
    } catch (error) {
      console.log(error);
    }
  }

  static async findOne(id) {
    try {
      let query = `
            SELECT * FROM "MutualFunds"
            WHERE "fundId" = $1
        `;

      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Model;
