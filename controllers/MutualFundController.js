const MutualFund = require("../models/mutualFunds");
const MutualFundsTransactions = require("../models/mutualFundTransactionModel");
const UserMutualFunds = require("../models/userMutualFundsModel");
const QRCode = require("qrcode");
const jsQR = require("jsqr");
const { createCanvas, loadImage } = require("canvas");

class MutualFundController {
  static async listTransaction(req, res, next) {
    try {
      const data = await MutualFundsTransactions.list();
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const data = await MutualFund.findAll();
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async userFund(req, res, next) {
    try {
      let userId = req.user.id;
      const data = await UserMutualFunds.findByUser(userId);

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async buy(req, res, next) {
    try {
      let userId = req.user.id;
      let fundId = req.params.id;
      let { units } = req.body;
      let transactionType = "buy";

      // panggil model untuk create trannsaction
      const data = await MutualFundsTransactions.create(
        fundId,
        userId,
        transactionType,
        +units
      );

      QRCode.toFile(
        `data/qrcode/${
          "buy_" +
          new Date().toJSON().slice(0, 10) +
          "_" +
          new Date().getHours() +
          new Date().getMinutes() +
          new Date().getSeconds()
        }.png`,
        `${data.transactionId}`,
        {
          errorCorrectionLevel: "H",
        },
        function (err) {
          if (err) throw err;
          console.log("QR code saved!");
        }
      );

      res.status(201).json({
        message: "Silahkan menyelesaikan pembayaran pembelian anda",
      });
    } catch (error) {
      console.log("Transaksi gagal", error);
      if (error) {
        throw { name: "failed_payment" };
      }
      next(error);
    }
  }

  static async sell(req, res, next) {
    try {
      let userId = req.user.id;
      let fundId = req.params.id;
      let { units } = req.body;
      let transactionType = "sell";
      const data = await MutualFundsTransactions.create(
        fundId,
        userId,
        transactionType,
        +units
      );
      res.status(201).json({
        message: "Transaksi sedang diproses",
        transactionId: data.transactionId,
      });
    } catch (error) {
      console.log(error);
      if (error) {
        throw { name: "failed_payment" };
      }
      next(error);
    }
  }

  static async switch(req, res, next) {
    try {
      let userId = req.user.id;
      let fromFundId = req.params.id;
      let { toFundId, totalUnitSwitch } = req.body;
      const data = await MutualFundsTransactions.switchMutualFunds(
        userId,
        fromFundId,
        toFundId,
        totalUnitSwitch
      );
      res.status(201).json({
        message: "Transaksi sedang diproses",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async paymentQR(req, res, next) {
    try {
      let imageData = req.file.buffer;
      const image = await loadImage(imageData);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const code = jsQR(
        ctx.getImageData(0, 0, image.width, image.height).data,
        image.width,
        image.height
      );

      const payment = await MutualFundsTransactions.updatePaymentProcess(
        code.data
      );

      res.status(200).json({
        message: "Pembayaran berhasil",
      });
    } catch (error) {
      console.log("Pembayaran gagal", error);
      if (error) {
        throw { name: "failed_payment" };
      }
      next(error);
    }
  }

  static async paymentBank(req, res, next) {
    try {
      let transactionId = req.params.id;
      let { accountNumber, bankName } = req.body;
      if (!accountNumber) {
        throw { name: "no_account_number" };
      }
      if (!bankName) {
        throw { name: "no_bankName" };
      }
      const payment = await MutualFundsTransactions.updatePaymentProcess(
        transactionId
      );

      res.status(200).json({
        message: `Dana sedang ditransfer ke rekening ${bankName} anda`,
      });
    } catch (error) {
      console.log("Pembayaran gagal", error);
      // if (error) {
      //   throw { name: "failed_payment" };
      // }
      next(error);
    }
  }
}

module.exports = MutualFundController;
