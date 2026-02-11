require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static dosyaları sun (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Postgres Bağlantı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// Kelime ekleme
app.post("/addWord", async (req, res) => {
  const { de, tr } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO sozluk (de, tr) VALUES ($1, $2) RETURNING id",
      [de, tr],
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Insert hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

// Son 5 kelime
app.get("/lastWords", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sozluk ORDER BY created_at DESC LIMIT 5",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tüm kelimeler
app.get("/allWords", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sozluk");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: Port ${PORT}`);
});
