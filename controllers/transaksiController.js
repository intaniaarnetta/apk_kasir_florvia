const Transaksi = require("../models/transaksiModel");
const Produk = require("../models/produkModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const generatePDF = require('../utils/generatePDF');

const transaksiController = {
beliProduk: async (req, res) => {
    try {
      const produk = await Produk.findById(req.params.id);
      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }

      const jumlah = parseInt(req.body.jumlah);
      if (!jumlah || isNaN(jumlah) || jumlah < 1) {
        return res.status(400).send("Jumlah tidak valid");
      }

      if (jumlah > produk.stok) {
        return res.status(400).send("Stok tidak mencukupi");
      }

      const totalHarga = produk.harga * jumlah;

      const transaksi = new Transaksi({
        produk_id: produk._id,
        user_id: req.session.user.id,
        nama_produk: produk.nama,
        jumlah: jumlah,
        total_harga: totalHarga,
        tgl_transaksi: new Date(),
        status: "diproses",
        nomor_pembelian: 1
      });

      await transaksi.save();
      produk.stok -= jumlah;
      await produk.save();

      req.session.transaksiTerakhirId = transaksi._id;

      res.redirect("/transaksi/pribadi");
    } catch (error) {
      console.error("❌ Gagal beli produk:", error);
      res.status(500).send("Terjadi kesalahan saat membeli produk.");
    }
  },

  getDaftarTransaksiAdmin: async (req, res) => {
    try {
      const transaksi = await Transaksi.find().populate("user_id", "nama");
      res.render("daftarTransaksiAdmin", { transaksi });
    } catch (error) {
      console.error("Error fetching transaksi:", error);
      res.status(500).send("Internal Server Error");
    }
  },

getTransaksiPribadi: async (req, res) => {
  try {
    const transaksi = await Transaksi.find({
        user_id: req.session.user.id,
        sudah_diexport_pdf: false
      })
      .sort({ tgl_transaksi: -1 })
      .populate("user_id", "nama");

    const hanyaTransaksiTerakhir = true; 

    const totalHargaKeseluruhan = transaksi.reduce((sum, item) => sum + item.total_harga, 0);

    res.render("transaksiSaya", {
      transaksi,
      totalHargaKeseluruhan,
      hanyaTransaksiTerakhir
    });
  } catch (error) {
    console.error("Error fetching transaksi pribadi:", error);
    res.status(500).send("Internal Server Error");
  }
},
  selesaiTransaksi: async (req, res) => {
    try {
      const transaksi = await Transaksi.findById(req.params.id);
      if (!transaksi) return res.status(404).send("Transaksi tidak ditemukan");

      transaksi.status = "selesai";
      await transaksi.save();

      res.redirect("/transaksi/pribadi");
    } catch (error) {
      console.error("Gagal menyelesaikan transaksi:", error);
      res.status(500).send("Gagal memperbarui transaksi");
    }
  },

exportPDFUser: async (req, res) => {
  try {
const transaksi = await Transaksi.find({
  user_id: req.session.user.id,
  status: 'selesai', 
  sudah_diexport_pdf: false
})


    if (!transaksi.length) {
      return res.status(404).send("Tidak ada transaksi baru untuk diekspor.");
    }

const transaksiData = transaksi.map((item) => ({
  tanggal: item.tgl_transaksi,
  namaProduk: item.nama_produk,
  jumlah: item.jumlah,
  harga: item.total_harga / item.jumlah,
}));

const totalKeseluruhan = transaksi.reduce((sum, item) => sum + item.total_harga, 0);

generatePDF(transaksiData, res, totalKeseluruhan);

    const ids = transaksi.map(item => item._id);
    await Transaksi.updateMany({ _id: { $in: ids } }, { $set: { sudah_diexport_pdf: true } });

  } catch (error) {
    console.error("❌ Error saat ekspor PDF:", error);
    res.status(500).send("Terjadi kesalahan saat mengekspor PDF.");
  }
},

  exportExcelUser: async (req, res) => {
    try {
      const transaksi = await Transaksi.find({ user_id: req.session.user.id }).populate("user_id", "nama");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Transaksi Saya");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Produk", key: "produk", width: 25 },
        { header: "Total Harga", key: "harga", width: 20 },
        { header: "Tanggal", key: "tanggal", width: 20 },
        { header: "Status", key: "status", width: 15 },
      ];

      transaksi.forEach((t, i) => {
        worksheet.addRow({
          no: i + 1,
          produk: t.nama_produk,
          harga: t.total_harga,
          tanggal: new Date(t.tgl_transaksi).toLocaleDateString("id-ID"),
          status: t.status,
        });
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=transaksi_saya.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Export Excel error:", err);
      res.status(500).send("Gagal membuat Excel");
    }
  },

  exportPDFAdmin: async (req, res) => {
    try {
      const transaksi = await Transaksi.find().populate("user_id", "nama");

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=laporan_transaksi_admin.pdf");

      doc.pipe(res);
      doc.fontSize(18).text("Laporan Semua Transaksi - Florvia", { align: "center" });
      doc.moveDown();

      transaksi.forEach((t, i) => {
        doc.fontSize(12).text(`${i + 1}. ${t.user_id?.nama || "-"} - ${t.nama_produk} - Rp${t.total_harga?.toLocaleString('id-ID')} - ${new Date(t.tgl_transaksi).toLocaleDateString("id-ID")} - ${t.status}`);
      });

      doc.end();
    } catch (err) {
      console.error("Export PDF Admin Error:", err);
      res.status(500).send("Gagal membuat PDF untuk admin");
    }
  },

  exportExcelAdmin: async (req, res) => {
    try {
      const transaksi = await Transaksi.find().populate("user_id", "nama");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Semua Transaksi");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama Pembeli", key: "nama", width: 25 },
        { header: "Produk", key: "produk", width: 25 },
        { header: "Tanggal", key: "tanggal", width: 20 },
        { header: "Total Harga", key: "harga", width: 18 },
        { header: "Status", key: "status", width: 15 },
      ];

      transaksi.forEach((t, i) => {
        worksheet.addRow({
          no: i + 1,
          nama: t.user_id?.nama || "-",
          produk: t.nama_produk,
          tanggal: new Date(t.tgl_transaksi).toLocaleDateString("id-ID"),
          harga: t.total_harga,
          status: t.status,
        });
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=laporan_transaksi_admin.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Export Excel Admin Error:", err);
      res.status(500).send("Gagal membuat Excel untuk admin");
    }
  }
};

module.exports = transaksiController;
