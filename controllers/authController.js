const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const authController = {
  getRegister: (req, res) => {
    res.render("register");
  },

  getLogin: (req, res) => {
    res.render("login");
  },

  register: async (req, res) => {
    try {
      const { nama, alamat, telepon, username, password } = req.body;

      const existingUser = await User.findOne({ "akun.username": username });
      if (existingUser) {
        return res.status(400).send("Username sudah digunakan");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        nama,
        alamat,
        telepon,
        akun: {
          username,
          password: hashedPassword,
          role: "pengguna"
        }
      });

      await newUser.save();
      res.redirect("/auth/login");
    } catch (error) {
      console.error("Error saat register:", error);
      res.status(500).send("Terjadi kesalahan saat registrasi");
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ "akun.username": username });
      if (!user) {
        return res.status(400).send("Username atau password salah");
      }

      const validPassword = await bcrypt.compare(password, user.akun.password);
      if (!validPassword) {
        return res.status(400).send("Username atau password salah");
      }

      req.session.user = {
        id: user._id,
        username: user.akun.username,
        role: user.akun.role
      };

      if (user.akun.role === "admin" || user.akun.role === "petugas") {
        res.redirect("/dashboard/admin");
      } else {
        res.redirect("/dashboard/pengguna");
      }

    } catch (error) {
      console.error("Error saat login:", error);
      res.status(500).send("Terjadi kesalahan saat login");
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Gagal logout");
      }
      res.redirect("/auth/login");
    });
  }
};

module.exports = authController;
