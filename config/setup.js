const pool = require("./connection");

(async () => {
  try {
    let queryCreateTableUsers = `
    CREATE TABLE IF NOT EXISTS "Users" (
        "userId" uuid DEFAULT gen_random_uuid(),
        "firstName" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "email" VARCHAR NOT NULL,
        "password" VARCHAR NOT NULL,
        "phone" VARCHAR,
        PRIMARY KEY ("userId")
    );
        `;

    let queryCreateTableMutualFunds = `
        CREATE TABLE IF NOT EXISTS "MutualFunds"(
            "fundId" uuid DEFAULT gen_random_uuid(),
            "fundName" VARCHAR NOT NULL,
            "nav" NUMERIC(12, 4),
            company VARCHAR NOT NULL,
            PRIMARY KEY ("fundId")
        )
    `;

    let queryCreateTableUserMutualFunds = `
        CREATE TABLE IF NOT EXISTS "UserMutualFunds" (
            "userFundId" uuid DEFAULT gen_random_uuid(),
            "fundId" uuid NOT NULL,
            "userId" uuid NOT NULL,
            date TIMESTAMP NOT NULL,
            units NUMERIC(12, 4) NOT NULL,
            PRIMARY KEY("userFundId"),
            CONSTRAINT "FK_Fund"
                FOREIGN KEY ("fundId")
                REFERENCES "MutualFunds"("fundId"),
            CONSTRAINT "FK_User"
                FOREIGN KEY ("userId")
                REFERENCES "Users"("userId")
        )
    `;

    let queryCreateTableProcessTransactions = `
        CREATE TABLE IF NOT EXISTS "ProcessTransactions"(
            "transactionId" uuid DEFAULT gen_random_uuid(),
            "fundId" uuid NOT NULL,
            "toFundId" uuid,
            "userId" uuid NOT NULL,
            "transactionDate" TIMESTAMP NOT NULL,
            "transactionType" VARCHAR NOT NULL,
            "units" NUMERIC(12, 4) NOT NULL,
            "toUnitFunds" NUMERIC(12, 4),
            "amount" NUMERIC(12, 4) NOT NULL,
            "nav" NUMERIC(12, 4) NOT NULL,
            "fees" NUMERIC(12, 4) NOT NULL,
            "tax" NUMERIC(12, 4) NOT NULL,
            "totalAmount" NUMERIC(12) NOT NULL,
            "isPending" BOOL DEFAULT FALSE,
            "isPaid" BOOL DEFAULT FALSE,
            PRIMARY KEY ("transactionId"),
            CONSTRAINT "FK_Fund"
                FOREIGN KEY ("fundId")
                REFERENCES "MutualFunds"("fundId"),
            CONSTRAINT "FK_User"
                FOREIGN KEY ("userId")
                REFERENCES "Users"("userId")
        )
    `;

    let queryCreateTableMutualFundsTransactions = `
    
        CREATE TABLE IF NOT EXISTS "MutualFundsTransactions" (
            "transactionId" uuid DEFAULT gen_random_uuid(),
            "fundId" uuid NOT NULL,
            "toFundId" uuid,
            "userId" uuid NOT NULL,
            "transactionDate" TIMESTAMP NOT NULL,
            "transactionType" VARCHAR NOT NULL,
            "units" NUMERIC(12, 4) NOT NULL,
            "toUnitFunds" NUMERIC(12, 4),
            "amount" NUMERIC(12, 4) NOT NULL,
            "nav" NUMERIC(12, 4) NOT NULL,
            "fees" NUMERIC(12, 4) NOT NULL,
            "tax" NUMERIC(12, 4) NOT NULL,
            "totalAmount" NUMERIC(12, 4) NOT NULL,
            PRIMARY KEY ("transactionId"),
            CONSTRAINT "FK_Fund"
                FOREIGN KEY ("fundId")
                REFERENCES "MutualFunds"("fundId")
        )
    `;
    let dropTable = `
            DROP TABLE IF EXISTS "Users", "MutualFunds", "ProcessTransactions", "UserMutualFunds", "MutualFundsTransactions"
        `;

    await pool.query(dropTable);
    await pool.query(queryCreateTableUsers);
    await pool.query(queryCreateTableMutualFunds);
    await pool.query(queryCreateTableProcessTransactions);
    await pool.query(queryCreateTableUserMutualFunds);
    await pool.query(queryCreateTableMutualFundsTransactions);

    console.log("SUCCESS CREATE TABLE");
  } catch (error) {
    console.log(error);
    console.log("SETUP ERROR");
  }
})();
