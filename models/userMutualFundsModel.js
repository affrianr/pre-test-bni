const pool = require("../config/connection");

class Model {
  static async findByUserFund(userId, fundId) {
    try {
      let query = `
            SELECT * FROM "UserMutualFunds"
            WHERE "userId" = $1 AND "fundId" = $2
        `;
      let { rows } = await pool.query(query, [userId, fundId]);
      return rows[0];
    } catch (error) {
      console.log(error);
    }
  }
  static async create(transactionId) {
    try {
      let findTransactionQuery = `
                SELECT * FROM "ProcessTransactions"
                WHERE "transactionId" = '${transactionId}'
            `;

      let findTransaction = await pool.query(findTransactionQuery);
      let transaction = findTransaction.rows[0];

      let insertQuery = `
        INSERT INTO "UserMutualFunds" ("fundId", "userId", date, units)
        VALUES ($1, $2, $3, $4)
      `;
      let data = await pool.query(insertQuery, [
        transaction.fundId,
        transaction.userId,
        transaction.transactionDate,
        transaction.units,
      ]);

      return data.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async update(transactionId, units) {
    try {
      let findTransactionQuery = `
                SELECT * FROM "ProcessTransactions"
                WHERE "transactionId" = $1
            `;
      let findTransaction = await pool.query(findTransactionQuery, [
        transactionId,
      ]);
      let transaction = findTransaction.rows[0];
      let newUnits = 0;

      let findUserFundQuery = `
        SELECT * from "UserMutualFunds"
        WHERE "userId" = $1 AND "fundId" = $2
      `;
      let userFundResult = await pool.query(findUserFundQuery, [
        transaction.userId,
        transaction.fundId,
      ]);
      let userFund = userFundResult.rows[0];

      console.log(userFund);
      if (transaction.transactionType == "buy") {
        newUnits = Number(userFund.units) + Number(units);
      } else if (transaction.transactionType == "sell") {
        if (+userFund.units < +units) {
          throw { name: "units_shortage" };
        }
        newUnits = Number(userFund.units) - Number(units);
      }

      let updateQuery = `
        UPDATE "UserMutualFunds"
        SET units = $1
        WHERE "userId" = $2 AND "fundId" = $3
        RETURNING *
      `;
      let updated = await pool.query(updateQuery, [
        newUnits,
        transaction.userId,
        transaction.fundId,
      ]);

      return updated.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async switch(transactionId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let findTransactionQuery = `
            SELECT * FROM "ProcessTransactions"
            WHERE "transactionId" = $1
        `;

      let findTransaction = await client.query(findTransactionQuery, [
        transactionId,
      ]);
      let transaction = findTransaction.rows[0];

      let newUnits = 0;
      console.log(transaction, "<<<<<< model switch user mutual");
      if (transaction.fundId) {
        // kurangi unit dari mutual fund asal
        let fundQuery = `
                SELECT units FROM "UserMutualFunds"
                WHERE "userId" = $1 AND "fundId" = $2
            `;
        let fundResult = await client.query(fundQuery, [
          transaction.userId,
          transaction.fundId,
        ]);
        let fund = fundResult.rows[0];
        if (!fund) {
          throw {
            name: "fund_not_found",
          };
        }
        newUnits = fund.units - transaction.units;

        let updateSourceQuery = `
        UPDATE "UserMutualFunds"
        SET units = $1
        WHERE "userId" = $2 AND "fundId" = $3
        RETURNING *
    `;
        await client.query(updateSourceQuery, [
          newUnits,
          transaction.userId,
          transaction.fundId,
        ]);
      }

      // tambahkan unit ke mutual fund tujuan
      let toFundQuery = `
            SELECT units FROM "UserMutualFunds"
            WHERE "userId" = $1 AND "fundId" = $2
        `;
      console.log(transaction.toFundId, "<<<<<<<<< toFundQuery");
      let toFundResult = await client.query(toFundQuery, [
        transaction.userId,
        transaction.toFundId,
      ]);
      let toFund = toFundResult.rows[0];

      if (!toFund) {
        // jika tidak ada mutual fund tujuan, buat baru
        let insertQuery = `
                INSERT INTO "UserMutualFunds" ("fundId", "userId", "date", "units")
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
        let data = await client.query(insertQuery, [
          transaction.toUnitFunds,
          transaction.userId,
          transaction.transactionDate,
          transaction.units,
        ]);
        toFund = data.rows[0];
        newUnits = transaction.units;
      } else {
        // jika ada mutual fund tujuan, tambahkan unit
        newUnits = +toFund.units + +transaction.units;
      }

      // update unit mutual fund tujuan
      let updateTargetQuery = `
            UPDATE "UserMutualFunds"
            SET units = $1
            WHERE "userId" = $2 AND "fundId" = $3
            RETURNING *
        `;
      let updatedTarget = await client.query(updateTargetQuery, [
        newUnits,
        transaction.userId,
        transaction.toFundId,
      ]);

      await client.query("COMMIT");
      return updatedTarget.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Model;
