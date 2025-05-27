const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");
const checkSession = require("../middleware/checkSession");
const uploadImage = require("../middleware/uploadImage");
const Produk = require("../models/produkModel");
const Transaksi = require("../models/transaksiModel");

router.get("/", checkSession, produkController.getDaftarProduk);
router.get("/tambah", checkSession, produkController.getFormTambahProduk);
router.get("/pengguna", checkSession, produkController.getDaftarProdukPengguna);
router.get("/edit/:id", checkSession, produkController.getFormEditProduk);
router.post("/tambah", checkSession, uploadImage.single("foto"), produkController.tambahProduk);
router.post("/edit/:id", checkSession, uploadImage.single("foto"), produkController.editProduk);
router.get("/delete/:id", checkSession, produkController.deleteProduk);
router.get("/dashboard", checkSession, async (req, res) => {
    try {
        const totalProduk = await Produk.countDocuments();
        const totalTransaksi = await Transaksi.countDocuments();

        res.render("dashboard", {
            user: req.session.user,
            totalProduk,
            totalTransaksi
        });
    } catch (err) {
        console.error("Error loading dashboard:", err);
        res.status(500).send("Terjadi kesalahan saat memuat dashboard");
    }
});

module.exports = router;
