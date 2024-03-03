const { UserClass } = require("./class");

const pool = require("../config/connection");
const { hashPassword } = require("../helpers/bcrypt");

class Model {
  static async create(firstName, lastName, email, password, phone) {
    try {
      let checkQuery = `
        SELECT * FROM "Users"
        WHERE email = '${email}'
      `;
      let check = await pool.query(checkQuery);
      if (check.rows[0]) {
        throw { name: "email_exist" };
      }
      let hashPass = hashPassword(password);
      let query = `
        INSERT INTO "Users" ("firstName", "lastName", "email", "password", "phone")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "userId", email
      `;
      const { rows } = await pool.query(query, [
        firstName,
        lastName,
        email,
        hashPass,
        phone,
      ]);

      return rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async findAll() {
    try {
      let query = `
        SELECT "firstName", "lastName", email, phone FROM "Users"
      `;

      const { rows } = await pool.query(query);
      let data = rows.map((el) => {
        return new UserClass(
          el.userId,
          el.firstName,
          el.lastName,
          el.email,
          el.phone
        );
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      let query = "";

      if (id) {
        query = `
          SELECT * FROM "Users"
          WHERE "userId" =  '${id}'
        `;
      }

      const { rows } = await pool.query(query);

      return rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async findOne(email) {
    try {
      let query = "";

      if (email) {
        query = `
          SELECT * FROM "Users"
          WHERE email =  '${email}'
        `;
      }

      const { rows } = await pool.query(query);

      return rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async delete(id, email) {
    try {
      let query = "";
      if (id) {
        query = `
          DELETE FROM "Users"
          WHERE "userId" = ${+id}
          RETURNING "userId"
        `;
      }
      if (email) {
        query = `
          DELETE FROM "Users"
          WHERE "email" =  ${email}
          RETURNING "userId"
        `;
      }

      const { rows } = await pool.query(query);

      let data = rows.map((el) => {
        el.userId, el.firstName, el.lastName, el.email, el.phone;
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async;
}

module.exports = Model;
