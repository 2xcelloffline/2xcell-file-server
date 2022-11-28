require("dotenv").config({});
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const path = require("path");

const fileRoutes = require("./routes/apis/file.routes");
const contentRoutes = require("./routes/apis/content.routes");

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

app.use("/", express.static("resources"));

app.use("/api/v1/files", fileRoutes);
app.use("/api/v1/contents", contentRoutes);

app.get("/*", (req, res) => {
  try {
    const paths = req.path.split("/");
    const ext = paths[paths.length - 1].split(".")[1];
    const newFilePath = req.path.replace(`.${ext}`, ".epm");
    const file = path.resolve(
      path.join(__dirname, "resources", `${newFilePath}`)
    );
    return res.sendFile(file);
  } catch (err) {
    return res.send("File not found!");
  }
});

//RETURN REMAINING DOWNLOAD FILES

const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log(`UP and Running on ${PORT}`));
