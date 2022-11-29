const AppendInitVect = require("./AppendInitVect");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function generateFolder(folder) {
  return crypto.createHash("sha256").update(folder).digest();
}

exports.downloadFile = ({ file, folder }) => {
  const initVect = crypto.randomBytes(16);
  const FOLDER_PATHS = generateFolder(folder);
  const readStream = fs.createReadStream(file);
  const gzip = zlib.createGzip();
  const location = crypto.createCipheriv("aes256", FOLDER_PATHS, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  const writeStream = fs.createWriteStream(path.join(file));
  readStream.pipe(gzip).pipe(location).pipe(appendInitVect).pipe(writeStream);
};

exports.sendFile = ({ file, folder, res }) => {
  console.log("folder", folder);
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
