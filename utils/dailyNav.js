// const cron = require("node-cron");
const pool = require("../config/connection");

// angka acak antara min dan max
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

async function updateNav() {
  try {
    let mutualFunds = await pool.query(`SELECT * FROM "MutualFunds"`);
    mutualFunds = mutualFunds.rows;

    mutualFunds.forEach(async (fund) => {
      // perubahan nilai NAV (misalnya, antara -1% hingga +1%)
      const change = randomInRange(-1, 1) / 100;

      // nilai NAV baru
      const newNav = fund.nav * (1 + change);

      const updated = await pool.query(
        `UPDATE "MutualFunds" SET nav = $1 WHERE "fundId" = $2 
        RETURNING *`,
        [newNav, fund.fundId]
      );
    });

    console.log("Nilai NAV berhasil diperbarui.");
  } catch (error) {
    console.log("Terjadi kesalahan dalam memperbarui nilai NAV:", error);
  }
}

module.exports = updateNav;
// updateNav setiap hari pada jam 00:00
// cron.schedule("* * * * *", () => {
//   console.log("Mengeksekusi perbaruan nilai NAV...");
//   updateNav();
// });
