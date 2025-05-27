const express = require("express");
const app = express();
const connectDB = require("./config/db");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const port = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");
const produkRoutes = require("./routes/produkRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "florvia-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

app.use("/auth", authRoutes);
app.use("/produk", produkRoutes);
app.use("/transaksi", transaksiRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(port, () => {
    console.log(`Florvia kasir running on http://localhost:${port}`);
});
