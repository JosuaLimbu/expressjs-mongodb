const express = require('express');
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const client = require("./mongodb");

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(morgan("tiny"));

//Konfigurasi upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const fileUpload = multer({ storage });

app.get('/', (req, res) => {
    res.send('This is the home page');
});

// Menampilkan semua data users
app.get("/users", async (req, res) => {
  const db = client.db("latihan");
  const users = await db.collection("users").find().toArray();
  res.json(users);

  // let query = req.query;

  // res.json(users);
});

// Menampilkan data user berdasarkan nama
app.get("/users/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const user = users.find((user) => user.name.toLowerCase() === name);
  if (user) {
    res.json(user);
  } else {
      res.status(404).json({
        message: "Data tidak ditemukan",
    });
  }
});

// Menambahkan data user baru
app.post("/users", (req, res) => {
  const { id, name } = req.body;
  const newUser = { id, name };
  users.push(newUser);
  res.json({
    message: `Berhasil menambahkan username: ${name}, dan id: ${id}`,
    data: newUser
  });
});

// Upload file
app.post("/upload", fileUpload.single("file"), (req, res) => {
  const file = req.file;
  if (file) {
    let target = path.join(__dirname, "/public", file.originalname);
    console.log(target);
    fs.renameSync(file.path, target);
    res.send("file berhasil di-upload");
  } else {
    res.send("file gagal di-upload");
  }
});

// Mengubah data user berdasarkan nama
app.put("/users/:name", (req, res) => {
  if (req.body.name == "") {
    res.json({ message: "error, tidak memasukkan data pada request body" });
  }
  users.forEach((e) => {
    if (req.params.name.toLocaleLowerCase() == e.name.toLocaleLowerCase()) {
      e.name = req.body.name;
      res.json(e);
    }
  });
  res.json({ message: "tidak menemukan nama yang sesuai" });
});

// Menghapus data user berdasarkan nama
app.delete("/users/:name", (req, res) => {
  users.forEach((e, i) => {
    if (req.params.name.toLocaleLowerCase() == e.name.toLocaleLowerCase()) {
      users.splice(i, 1);
      res.json(users);
    }
  });
  res.json({ message: "tidak menemukan nama yang sesuai" });
});


app.use((req, res, next) => {
  res.json({
    status: "error",
    message: "resource tidak ditemukan",
  });
});

const errorHandling = (err, req, res, next) => {
  res.json({
    status: "error",
    message: "terjadi kesalahan pada server",
  });
};
app.use(errorHandling);
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);