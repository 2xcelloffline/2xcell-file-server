require("dotenv").config({});
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const app = express();

const { sendFile, removeLoad } = require("./filemanager");

const fileRoutes = require("./routes/apis/file.routes");
const contentRoutes = require("./routes/apis/content.routes");
const { createCipheriv } = require("crypto");

mongoose
  .connect(process.env.MONGOURI || "mongodb://127.0.0.1:27017/2xcellDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,
    keepAlive: true,
  })
  .then(() => console.log("connected"))
  .catch((err) => {
    console.log(err.name, err.message);
  });

mongoose.connection.on("disconnected", () =>
  console.log(`DB: Database disconnected ${new Date()}`)
);

mongoose.connection.on("reconnected", () =>
  console.log(`DB: Database reconnected ${new Date()}`)
);

app.use(express.json());
//set cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Token"
  );
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use(async (req, res, next) => {
  try {
    await removeLoad();
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.use("/api/v1/files", fileRoutes);
app.use("/api/v1/contents", contentRoutes);

app.get("*", (req, res) => {
  try {
    if (req.originalUrl.startsWith("/myresources")) {
      const file = path.resolve(path.join(__dirname, `${req.originalUrl}`));
      return res.sendFile(file);
    }
    const filepath = decodeURI(req.path);
    const file = path.resolve(path.join(__dirname, "resources", `${filepath}`));
    if (!fs.existsSync(file)) {
      throw { message: "File not found!" };
    }
    sendFile({ file, folder: process.env.FOLDERS, res });
  } catch (err) {
    console.log(err);
    return res.send("File not found!");
  }
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
});

process.on("UnhandledRejection", (err) => {
  console.log(err.message);
});

process.on("error", (err) => {
  console.log(err.message);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log(`UP and Running on ${PORT}`));
