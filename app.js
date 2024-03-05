if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const UserController = require("./controllers/UserController");
const MutualFundController = require("./controllers/MutualFundController");
const app = express();
const port = 3000;
const cron = require("node-cron");
const updateNav = require("./utils/dailyNav");
const authentication = require("./middlewares/authentication");
const processPendingTransactions = require("./utils/pendingTransaction");
const multer = require("multer");
const errorHandlers = require("./middlewares/errorHandler");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/api/register", UserController.register);
app.post("/api/login", UserController.login);
app.get("/api/mutual-fund", MutualFundController.list);
app.use(authentication);
app.get("/api/transaction/list", MutualFundController.listTransaction);
app.get("/api/user/list", MutualFundController.userFund);
app.post("/api/mutual-fund/:id/buy", MutualFundController.buy);
app.post("/api/mutual-fund/:id/sell", MutualFundController.sell);
app.post("/api/mutual-fund/:id/switch", MutualFundController.switch);
app.post(
  "/api/payment/qr",
  upload.single("image"),
  MutualFundController.paymentQR
);
app.post("/api/payment/:id/bank-transfer", MutualFundController.paymentBank);

app.listen(port, () => {
  console.log(`Listening at port: ${port} `);
});

cron.schedule(
  "*/5 8-14 * * 1-5'",
  () => {
    console.log("Mengeksekusi perbaruan nilai NAV tiap 5 menit...");
    updateNav();
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

cron.schedule(
  "* 8-15 * * 1-5",
  // "* * * * *",

  () => {
    console.log("Menjalakan proses yang pending");
    processPendingTransactions();
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

app.use(errorHandlers);

module.exports = app;
