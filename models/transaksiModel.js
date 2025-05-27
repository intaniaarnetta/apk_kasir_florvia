const mongoose = require("mongoose");

const transaksiSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nama_produk: String,
  jumlah: Number,
  total_harga: Number,
  tgl_transaksi: Date,
  status: String,
  nomor_pembelian: Number,
  sudah_diexport_pdf: { type: Boolean, default: false } // ✅ Tambahkan field ini
});

// 🔢 Hitung nomor pembelian
transaksiSchema.pre("save", async function (next) {
  if (this.nomor_pembelian != null) return next();

  const jumlah = await mongoose.model("Transaksi").countDocuments({ user_id: this.user_id });
  this.nomor_pembelian = jumlah + 1;

  next();
});

module.exports = mongoose.model("Transaksi", transaksiSchema);
