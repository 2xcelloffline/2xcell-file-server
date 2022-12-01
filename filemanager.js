const AppendInitVect = require("./AppendInitVect");
const crypto = require("crypto");
const fs = require("fs");
const zlib = require("zlib");

function generateFolder(folder) {
  return crypto.createHash("sha256").update(folder).digest();
}

exports.downloadFile = ({ source, destination, folder }) => {
  const initVect = crypto.randomBytes(16);
  const FOLDER_PATHS = generateFolder(folder);
  const readStream = fs.createReadStream(source);
  const gzip = zlib.createGzip();
  const location = crypto.createCipheriv("aes256", FOLDER_PATHS, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  const writeStream = fs.createWriteStream(destination);
  readStream.pipe(gzip).pipe(location).pipe(appendInitVect).pipe(writeStream);
};

exports.sendFile = ({ file, folder, res }) => {
  console.log("folder", folder);
  console.log(file);
  const readInitVect = fs.createReadStream(file, { end: 15 });
  let initVect;
  readInitVect.on("data", (chunk) => {
    initVect = chunk;
  });
 
  readInitVect.on("close", () => {
    const FOLDER_PATHS = generateFolder(folder);
    const readStream = fs.createReadStream(file, { start: 16 });
    console.log(initVect);
    const location = crypto.createDecipheriv("aes256", FOLDER_PATHS, initVect);
    const unzip = zlib.createUnzip();
    readStream.pipe(location).pipe(unzip).pipe(res);
  });
};
