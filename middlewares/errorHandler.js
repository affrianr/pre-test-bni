function errorHandlers(error, req, res, next) {
  switch (error.name) {
    case "unauthorized":
      res.status(401).json({ message: "Kesalahan auntentikasi" });
      break;
    case "login_error":
      res.status(401).json({ message: "Email atau kata sandi tidak valid" });
      break;
    case "not_found":
      res.status(404).json({ message: "Data tidak ditemukan" });
      break;
    case "mismatched_company":
      res.status(400).json({
        message: "Perusahaan reksadana untuk dana sumber dan tujuan harus sama",
      });
      break;
    case "units_shortage":
      res.status(400).json({
        message:
          "Anda tidak memiliki cukup reksadana untuk melakukan tindakan ini",
      });
      break;
    case "no_account_number":
      res.status(400).json({
        message: "Harap masukkan nomor rekening anda",
      });
      break;
    case "no_bankName":
      res.status(400).json({
        message: "Harap pilih bank tujuan anda",
      });
      break;
    case "failed_payment":
      res.status(400).json({
        message: "Transaksi gagal",
      });
      break;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid Token" });
      break;
    case "SequelizeUniqueConstraintError":
      const err1 = error.errors.map((el) => el.message);
      res.status(400).json({ message: err1[0] });
    default:
      res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = errorHandlers;
