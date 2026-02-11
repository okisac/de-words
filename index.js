const express = require("express");
const { Pool } = require("pg"); // mysql2 yerine pg kullanıyoruz
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Postgres Bağlantı Ayarları (Lokal için)
const pool = new Pool({
  user: "a", // Mac'teki Postgres kullanıcı adın (genelde postgres)
  host: "localhost",
  database: "words", // Veritabanı adın
  password: "root", // Şifren
  port: 5432, // Postgres varsayılan portu 5432'dir
});

// Bağlantı Kontrolü
pool.connect((err) => {
  if (err) {
    console.error("Postgres bağlantı hatası:", err.stack);
  } else {
    console.log("Postgres’e bağlanıldı!");
  }
});

// Kelime ekleme endpointi
app.post("/addWord", async (req, res) => {
  const { de, tr } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO sozluk (de, tr) VALUES ($1, $2) RETURNING id",
      [de, tr],
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Postgres insert hatası:", err);
    res.status(500).send(err);
  }
});

// Son 5 kelimeyi getiren endpoint
app.get("/lastWords", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sozluk ORDER BY created_at DESC LIMIT 5",
    );
    res.send(result.rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Tüm kelimeleri getiren endpoint
app.get("/allWords", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sozluk");
    res.send(result.rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
