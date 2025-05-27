const Produk = require("../models/produkModel");
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const produkController = {
    getDaftarProduk: async (req, res) => {
        try {
            const produkList = await Produk.find();
            res.render('daftarProduk', { produkList });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getDaftarProdukPengguna: async (req, res) => {
        try {
            const produkList = await Produk.find({ stok: { $gt: 0 } });
            res.render('daftarBungaPengguna', { produkList });
        } catch (error) {
            console.error("Error fetching products for pengguna:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getFormTambahProduk: (req, res) => {
        try {
            res.render('formTambahBunga');
        } catch (error) {
            console.error("Error rendering form tambah:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    tambahProduk: async (req, res) => {
        try {
            const { nama, jenis, asal, stok, harga } = req.body;
            const foto = req.file ? req.file.filename : null;

            const produk = new Produk({
                nama,
                jenis,
                asal,
                stok,
                harga,
                foto
            });

            await produk.save();
            res.redirect('/produk');
        } catch (error) {
            console.error("Error adding product:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getFormEditProduk: async (req, res) => {
        try {
            const produk = await Produk.findById(req.params.id);
            if (!produk) return res.status(404).send("Produk tidak ditemukan");
            res.render('formEditBunga', { produk });
        } catch (error) {
            console.error("Error rendering form edit:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    editProduk: async (req, res) => {
        try {
            const produk = await Produk.findById(req.params.id);
            if (!produk) return res.status(404).send("Produk tidak ditemukan");

            const { nama, jenis, asal, stok, harga } = req.body;
            const newFoto = req.file ? req.file.filename : null;

            if (newFoto && produk.foto) {
                const oldImagePath = path.join(__dirname, '../public/image', produk.foto);
                if (fs.existsSync(oldImagePath)) {
                    await fsPromises.unlink(oldImagePath);
                }
            }

            produk.nama = nama;
            produk.jenis = jenis;
            produk.asal = asal;
            produk.stok = stok;
            produk.harga = harga;
            produk.foto = newFoto || produk.foto;

            await produk.save();
            res.redirect('/produk');
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    deleteProduk: async (req, res) => {
        try {
            const produk = await Produk.findById(req.params.id);
            if (!produk) return res.status(404).send("Produk tidak ditemukan");

            if (produk.foto) {
                const imagePath = path.join(__dirname, '../public/image', produk.foto);
                if (fs.existsSync(imagePath)) {
                    await fsPromises.unlink(imagePath);
                }
            }

            await Produk.findByIdAndDelete(req.params.id);
            res.redirect('/produk');
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).send("Internal Server Error");
        }
    }
};

module.exports = produkController;
