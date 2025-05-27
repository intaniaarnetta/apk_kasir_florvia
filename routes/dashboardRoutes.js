const express = require("express");
const router = express.Router();
const Produk = require("../models/produkModel");
const Transaksi = require("../models/transaksiModel");
const checkSession = require("../middleware/checkSession");
const checkRole = require("../middleware/checkRole");

router.get("/admin", checkSession, checkRole(["admin", "petugas"]), async (req, res) => {
  const totalProduk = await Produk.countDocuments();
  const totalTransaksi = await Transaksi.countDocuments();

  res.render("dashboardAdmin", {
    user: req.session.user,
    totalProduk,
    totalTransaksi
  });
});

router.get("/pengguna", checkSession, checkRole("pengguna"), (req, res) => {
  res.render("dashboardPengguna", {
    user: req.session.user
  });
});

module.exports = router;
