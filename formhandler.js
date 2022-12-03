const formidable = require("formidable");

/**
 * @name parseFormData
 * @description parse text field and file fields
 */
const parseFormData = function (req) {
  const form = formidable({ multiples: true });
  const formdata = { fields: {}, files: [] };
  return new Promise((resolve, reject) => {
    form.parse(req);
    //handle files and Fields
    form.onPart = (part) => {
      //handle field
      if (!part.filename) {
        form.handlePart(part);
        return;
      }
      //handle normal files
      part.on("data", (buffer) => {
        form.emit("file", {
          fieldname: part.name,
          filename: part.filename,
          filetype: part.mime,
          filevalue: buffer,
        });
      });
    };
    //handle field data
    form.on(
      "field",
      (fieldname, fieldvalue) => (formdata.fields[fieldname] = fieldvalue)
    );
    //handle file data
    form.on("file", (file) => {
      console.log(file);
      const { fieldname, filename, filevalue, filetype } = file;
      const fileIndex = formdata.files.findIndex(
        (file) =>
          file.filename === filename && file.fieldname === file.fieldname
      );
      //if filename exist then concat file buffer
      if (fileIndex > -1) {
        const file = formdata.files[fileIndex];
        const bufferList = [file.filevalue, filevalue];
        file.filevalue = Buffer.concat(bufferList);
      } //push new file with buffer
      else formdata.files.push({ fieldname, filename, filevalue, filetype });
    });

    form.on("error", (err) => {
      form.onPart = null;
      form.pause();
      console.log(err);
      reject(err);
    });
    form.on("end", () => {
      console.log("endd");
      resolve(formdata);
    });
  });
};

exports.parseUploadFormData = async (req, res, next) => {
  try {
    const formdata = await parseFormData(req);
    req.body = { ...req.body, ...formdata.fields };
    req.files = formdata.files;
    //Extract Zip File
    const zipFileIndex = req.files.findIndex((file) =>
      file.filename.endsWith(".zip")
    );
    if (zipFileIndex > -1) {
      const zipFile = req.files[zipFileIndex];
      //remove zip from array
      req.files.splice(zipFileIndex, 1);
      const unzippedDirectories = await unzipper.Open.buffer(zipFile.filevalue);
      for await (directory of unzippedDirectories.files) {
        if (directory.path.endsWith("/")) continue;
        const bufferContent = await directory.buffer();
        req.files.push({
          fieldname: zipFile.fieldname,
          filename: directory.path,
          filevalue: bufferContent,
        });
      }
    }
    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
