const AppendInitVect = require("./AppendInitVect");
const crypto = require("crypto");
const fs = require("fs");
const zlib = require("zlib");
const getmac = require("getmac");

function generateFolder(folder) {
  return crypto.createHash("sha256").update(folder).digest();
}

exports.downloadFile = ({ source, destination, tempDir, folder }) => {
  const initVect = crypto.randomBytes(16);
  const FOLDER_PATHS = generateFolder(folder);
  const readStream = fs.createReadStream(source);
  const gzip = zlib.createGzip();
  const location = crypto.createCipheriv("aes256", FOLDER_PATHS, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  const writeStream = fs.createWriteStream(destination).on("finish", () => {
    fs.unlinkSync(source);
    fs.rmdirSync(tempDir);
  });
  readStream.pipe(gzip).pipe(location).pipe(appendInitVect).pipe(writeStream);
};

exports.sendFile = ({ file, folder, res }) => {
  const readInitVect = fs.createReadStream(file, { end: 15 });
  let initVect;
  readInitVect.on("data", (chunk) => {
    initVect = chunk;
  });

  readInitVect.on("close", () => {
    const FOLDER_PATHS = generateFolder(folder);
    const readStream = fs.createReadStream(file, { start: 16 });
    const location = crypto.createDecipheriv("aes256", FOLDER_PATHS, initVect);
    const unzip = zlib.createUnzip();
    readStream.pipe(location).pipe(unzip).pipe(res);
  });
};

exports.removeLoad = () => {
  return new Promise((resolve, reject) => {
    var chunk = [];
    const readInitVect = fs
      .createReadStream("license.key", { end: 15 })
      .on("error", () => {
        reject({
          message: "Invalid License Key!",
        });
      });

    let initVect;
    readInitVect.on("data", (chunk) => {
      initVect = chunk;
    });

    readInitVect.on("error", () => {
      reject({
        message: "Invalid License Key!",
      });
    });

    readInitVect.on("close", () => {
      const FOLDER_PATHS = crypto
        .createHash("sha256")
        .update(process.env.LOAD)
        .digest();
      const readStream = fs
        .createReadStream("license.key", { start: 16 })
        .on("error", () => {
          reject({
            message: "Invalid License Key!",
          });
        });
      const location = crypto.createDecipheriv(
        "aes256",
        FOLDER_PATHS,
        initVect
      );
      const unzip = zlib.createUnzip();

      readStream
        .pipe(location)
        .pipe(unzip)
        .on("data", (data) => {
          chunk.push(data);
        })
        .on("end", () => {
          const key = Buffer.concat(chunk).toString();
          const [mac, expiry] = key.split("-");

          if (mac !== getmac.default().replace(/:/g, "")) {
            reject({
              message: "Invalid License Key!",
            });
          }

          if (new Date(expiry).getTime() <= Date.now()) {
            reject({
              message: "License Expired!",
            });
          }

          resolve({ status: "success" });
        })
        .on("error", () => {
          reject({
            message: "Invalid License Key!",
          });
        });
    });
  });
};
