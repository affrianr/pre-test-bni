const pool = require("../config/connection");
const UserMutualFunds = require("../models/userMutualFundsModel");

async function processPendingTransactions() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let query = `
          INSERT INTO "MutualFundsTransactions" ("fundId", "toFundId", "userId", "transactionDate", "transactionType", "units", "toUnitFunds", "amount", "nav", "fees", "tax", "totalAmount")
          SELECT "fundId", "toFundId", "userId", now() AT TIME ZONE 'Asia/Jakarta', "transactionType", "units", "toUnitFunds", "amount", "nav", "fees", "tax", "totalAmount"
          FROM "ProcessTransactions"
          WHERE "isPending" = TRUE AND "isPaid" = TRUE 
          RETURNING *;
        `;

    let workingHourQuery = `
          INSERT INTO "MutualFundsTransactions" ("fundId", "toFundId", "userId", "transactionDate", "transactionType", "units", "toUnitFunds", "amount", "nav", "fees", "tax", "totalAmount")
          SELECT "fundId", "toFundId", "userId", now() AT TIME ZONE 'Asia/Jakarta', "transactionType", "units", "toUnitFunds", "amount", "nav", "fees", "tax", "totalAmount"
          FROM "ProcessTransactions"
          WHERE "isPending" = FALSE AND "isPaid" = TRUE 
          RETURNING *
    `;

    let workingHourProcessQuery = `
        SELECT * FROM "ProcessTransactions"
        WHERE "isPending" = FALSE AND "isPaid" = TRUE
    `;

    let updateProcessQuery = `
      UPDATE "ProcessTransactions" SET "isPending" = FALSE
      WHERE "isPending" = TRUE AND "isPaid" = TRUE
      RETURNING *
    `;

    let deleteProcessQuery = `
      DELETE FROM "ProcessTransactions"
      WHERE "isPending" = FALSE AND "isPaid" = TRUE
    `;

    let transaction = await client.query(query);
    let workingHourtransaction = await client.query(workingHourQuery);
    // console.log(transaction.rows[0], "insert di mutualtransasctions");
    let updateTransaction = await client.query(updateProcessQuery);
    let workingHourProcess = await client.query(workingHourProcessQuery);
    await client.query(deleteProcessQuery);

    console.log("Transaksi telah diproses");

    await Promise.all(
      updateTransaction.rows.map(async (transaction) => {
        try {
          const userFund = await UserMutualFunds.findByUserFund(
            transaction.userId,
            transaction.fundId
          );
          console.log(transaction, "ini di promise all");
          if (transaction.transactionType !== "switch") {
            if (!userFund) {
              await UserMutualFunds.create(transaction.transactionId);
            } else {
              await UserMutualFunds.update(
                transaction.transactionId,
                transaction.units
              );
            }
          } else {
            await UserMutualFunds.switch(transaction.transactionId);
          }
        } catch (error) {
          console.log(
            "Terjadi kesalahan saat membuat entri baru di UserMutualFunds:",
            error
          );
          throw error;
        }
      })
    );
    await Promise.all(
      workingHourProcess.rows.map(async (transaction) => {
        try {
          const userFund = await UserMutualFunds.findByUserFund(
            transaction.userId,
            transaction.fundId
          );
          console.log(transaction, "ini di promise all");
          if (transaction.transactionType !== "switch") {
            if (!userFund) {
              await UserMutualFunds.create(transaction.transactionId);
            } else {
              await UserMutualFunds.update(
                transaction.transactionId,
                transaction.units
              );
            }
          } else {
            await UserMutualFunds.switch(transaction.transactionId);
          }
        } catch (error) {
          console.log(
            "Terjadi kesalahan saat membuat entri baru di UserMutualFunds:",
            error
          );
          throw error;
        }
      })
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Terjadi kesalahan saat memproses transaksi yang tertunda");
  } finally {
    client.release();
    console.log("Koneksi tertutup");
  }
}

module.exports = processPendingTransactions;
