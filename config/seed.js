const pool = require("./connection");
const fs = require("fs/promises");

(async () => {
  try {
    let dataUsers = await fs.readFile("../data/users.json");
    dataUsers = JSON.parse(dataUsers);
    dataUsers = dataUsers
      .map((el) => {
        return `('${el.FirstName}', '${el.LastName}', '${el.Email}', '${el.Password}', '${el.Phone}')`;
      })
      .join(",\n");

    let dataMutualFunds = await fs.readFile("../data/mutualFunds.json");
    dataMutualFunds = JSON.parse(dataMutualFunds);
    dataMutualFunds = dataMutualFunds
      .map((el) => {
        return `('${el.FundName}', '${el.NAV}', '${el.Company}')`;
      })
      .join(",\n");

    let queryInsertUsers =
      `
        INSERT INTO "Users" ("firstName", "lastName", "email", "password", "phone")
        VALUES
    ` + dataUsers;

    let queryInsertMutualFunds =
      `
        INSERT INTO "MutualFunds" ("fundName", "nav", "company")
        VALUES
    ` + dataMutualFunds;

    await pool.query(queryInsertUsers);
    await pool.query(queryInsertMutualFunds);

    console.log("SEEDING SUCCESS");
  } catch (error) {
    console.log(error);
    console.log("SEEDING ERROR");
  }
})();
