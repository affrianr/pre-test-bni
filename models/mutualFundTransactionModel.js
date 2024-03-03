const pool = require("../config/connection");

class Model {
  static async create(fundId, userId, transactionType, units) {
    try {
      let fees = 0.02;
      let tax = 0;
      let transactionDate = new Date();
      let date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      });
      let startHour = 8;
      let endHour = 15;
      let today = new Date(date).getDay();
      let hour = new Date(date).getHours();
      let isWeekday = today >= 1 && today <= 5;
      let isWorkingHours = hour >= startHour || hour < endHour;
      let isPending = !isWeekday || !isWorkingHours;
      let isPaid = false;

      // masuk ke tabel processTransactions
      let fundQuery = `SELECT * FROM "MutualFunds" WHERE "fundId" = $1`;
      let fundResult = await pool.query(fundQuery, [fundId]);
      let fundRow = fundResult.rows[0];

      // hitung amount, unit x nav
      let amount = units * fundRow.nav;

      // hitung total amount
      let totalAmount = amount + amount * fees + amount * tax;

      let insertQuery = `
            INSERT INTO "ProcessTransactions"("fundId", "userId", "transactionDate", "transactionType", "units", "amount", "nav", "fees", "tax", "totalAmount", "isPending", "isPaid")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING * 
        `;

      const { rows } = await pool.query(insertQuery, [
        fundId,
        userId,
        transactionDate,
        transactionType,
        +units,
        +amount,
        +fundRow.nav,
        +fees,
        +tax,
        +totalAmount,
        isPending,
        isPaid,
      ]);
      console.log(
        "Transaksi akan dieksekusi pada hari kerja jika telah melakukan pembayaran"
      );

      return rows[0];
    } catch (error) {
      console.log("Transaksi gagal");
      console.log(error);
      throw error;
    }
  }

  static async switchMutualFunds(
    userId,
    fromFundId,
    toFundId,
    totalUnitSwitch
  ) {
    try {
      let fees = 0;
      let tax = 0;
      let transactionDate = new Date();
      let transactionType = "switch";

      let date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      });
      let startHour = 8;
      let endHour = 15;
      let today = new Date(date).getDay();
      let hour = new Date(date).getHours();
      let isWeekday = today >= 1 && today <= 5;
      let isWorkingHours = hour >= startHour || hour < endHour;
      let isPending = !isWeekday || !isWorkingHours;
      let isPaid = true;

      // cek perusahaan reksadana dari mutual fund asal
      const fromFundCompanyQuery = `
         SELECT company FROM "MutualFunds"
         WHERE "fundId" = $1
       `;
      const fromFundCompanyResult = await pool.query(fromFundCompanyQuery, [
        fromFundId,
      ]);
      const fromFundCompany = fromFundCompanyResult.rows[0].company;
      console.log(fromFundCompany);

      // cek perusahaan reksadana dari mutual fund tujuan
      const toFundCompanyQuery = `
         SELECT company FROM "MutualFunds"
         WHERE "fundId" = $1
       `;
      const toFundCompanyResult = await pool.query(toFundCompanyQuery, [
        toFundId,
      ]);
      const toFundCompany = toFundCompanyResult.rows[0].company;
      console.log(toFundCompany);

      // jika perusahaan tidak sama, throw error
      if (fromFundCompany !== toFundCompany) {
        throw { name: "mismatched_company" };
      }

      // cek jumlah unit fund yang dimiliki user pada mutual fund asal
      const fromFundUnitsQuery = `
          SELECT units from "UserMutualFunds"
          WHERE "userId" = $1 AND "fundId" = $2
        `;
      const fromFundUnitsResult = await pool.query(fromFundUnitsQuery, [
        userId,
        fromFundId,
      ]);

      // cek apakah user memiliki cukup mutual fund untuk ditukar
      const fromFundUnits = fromFundUnitsResult.rows[0].units;
      console.log(fromFundUnits, "<<", totalUnitSwitch);
      if (+fromFundUnits < +totalUnitSwitch) {
        throw { name: "units_shortage" };
      }

      // cek NAV dari mutual fund asal dan tujuan
      const fromFundNAVQuery = `
          SELECT nav FROM "MutualFunds"
          WHERE "fundId" = $1
        `;
      const fromFundNAVResult = await pool.query(fromFundNAVQuery, [
        fromFundId,
      ]);
      const fromFundNAV = fromFundNAVResult.rows[0].nav;

      const toFundNAVQuery = `
          SELECT nav FROM "MutualFunds"
          WHERE "fundId" = $1
        `;
      const toFundNAVResult = await pool.query(toFundNAVQuery, [toFundId]);
      const toFundNAV = toFundNAVResult.rows[0].nav;

      // hitung jumlah harga unit yang akan di-switch
      const amountToSwitch = totalUnitSwitch * fromFundNAV;

      // hitung jumlah unit yang didapatkan pada mutual fund tujuan
      const toUnitsFunds = amountToSwitch / toFundNAV;

      const totalAmount =
        amountToSwitch + amountToSwitch * fees + amountToSwitch * tax;

      const insertQuery = `
          INSERT INTO "ProcessTransactions"("fundId", "toFundId", "userId", "transactionDate", "transactionType", "units", "toUnitFunds", "amount", "nav", "fees", "tax", "totalAmount", "isPending", "isPaid")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING * 
        `;

      const { rows } = await pool.query(insertQuery, [
        fromFundId,
        toFundId,
        userId,
        transactionDate,
        transactionType,
        +totalUnitSwitch,
        +toUnitsFunds,
        +amountToSwitch,
        +fromFundNAV,
        +fees,
        +tax,
        +totalAmount,
        isPending,
        isPaid,
      ]);

      console.log(
        "Transaksi akan dieksekusi pada hari kerja jika telah melakukan pembayaran"
      );
      return rows[0];
    } catch (error) {
      console.log("Terjadi kesalahan saat melakukan switch transaksi:", error);
      throw error; //
    }
  }

  static async findProcess(transactionId) {
    try {
      let query = `
        SELECT * FROM "ProcessTransactions"
        WHERE "transactionId" = '${transactionId}'
      `;

      const data = await pool.query(query);

      return data.rows[0];
    } catch (error) {
      console.log(error);
    }
  }

  static async updatePaymentProcess(transactionId) {
    try {
      console.log(transactionId);
      let processQuery = `
        SELECT * FROM "ProcessTransactions"
        WHERE "transactionId" = '${transactionId}' AND "isPaid" = FALSE
      `;

      let data = await pool.query(processQuery);
      if (!data.rows[0]) {
        throw { name: "not_found" };
      }

      let updateQuery = `
        UPDATE "ProcessTransactions"
        SET "isPaid" = TRUE
        WHERE "transactionId" = '${transactionId}'
        RETURNING *
      `;

      let updated = await pool.query(updateQuery);
      return updated.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = Model;
