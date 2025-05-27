const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nama: String,
  alamat: String,
  telepon: String,
  akun: {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'petugas', 'pengguna'],
      required: true
    }
  }
});

module.exports = mongoose.model("User", userSchema);
