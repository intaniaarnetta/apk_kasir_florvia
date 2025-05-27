const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");
const checkSession = require("../middleware/checkSession");

router.get("/beli/:id", checkSession, transaksiController.beliProduk);
router.get("/pribadi", checkSession, transaksiController.getTransaksiPribadi);
router.get("/selesai/:id", checkSession, transaksiController.selesaiTransaksi);
router.get("/generate/pdf/pribadi", checkSession, transaksiController.exportPDFUser);
router.get("/generate/excel/pribadi", checkSession, transaksiController.exportExcelUser);
router.get("/", checkSession, transaksiController.getDaftarTransaksiAdmin);
router.get("/generate/pdf", checkSession, transaksiController.exportPDFAdmin);
router.get("/generate/excel", checkSession, transaksiController.exportExcelAdmin);
router.post("/beli/:id", checkSession, transaksiController.beliProduk);

module.exports = router;
