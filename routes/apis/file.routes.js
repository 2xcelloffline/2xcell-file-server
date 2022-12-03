const router = require("express").Router();
const { default: axios } = require("axios");
const fs = require("fs");

const { downloadFile } = require("../../filemanager");
const { parseUploadFormData } = require("../../formhandler");

const models = {
  subject: require("../../model/courseModels/subject"),
  chapter: require("../../model/courseModels/chapter"),
  topic: require("../../model/courseModels/topic"),
  module: require("../../model/courseModels/module"),
};

/**
 * @description return array of urls to download
 */
router.get("/remaining-downloads", async (req, res) => {
  try {
    var subjects = await models["subject"].aggregate([
      {
        $match: {
          disabled: false,
        },
      },
      {
        $group: {
          _id: "$thumbnail",
          name: {
            $push: "$name",
          },
        },
      },
      {
        $project: {
          _id: 0,
          fileurl: "$_id",
          name: 1,
          type: "Subject",
        },
      },
    ]);

    var chapters = await models["chapter"].aggregate([
      {
        $match: {
          disabled: false,
        },
      },
      {
        $group: {
          _id: "$thumbnail",
          name: {
            $push: "$name",
          },
        },
      },
      {
        $project: {
          _id: 0,
          fileurl: "$_id",
          name: 1,
          type: "CHAPTER",
        },
      },
    ]);

    //FETCH TOPICS
    var topics = await models["topic"].aggregate([
      {
        $match: {
          disabled: false,
        },
      },
      {
        $group: {
          _id: "$thumbnail",
          name: {
            $push: "$name",
          },
        },
      },
      {
        $project: {
          _id: 0,
          fileurl: "$_id",
          name: 1,
          type: "Topic",
        },
      },
    ]);

    //FETCH MODULE FILES
    var modules = await models["module"].aggregate([
      {
        $match: {
          disabled: false,
        },
      },
      {
        $unwind: "$resources",
      },
      {
        $project: {
          moduleId: "$_id",
          name: "$name",
          fileurl: "$resources.fileUrl",
        },
      },
      {
        $group: {
          _id: "$fileurl",
          name: {
            $push: "$name",
          },
        },
      },
      {
        $project: {
          _id: 0,
          fileurl: "$_id",
          name: 1,
          type: "Module",
        },
      },
    ]);

    var fileLinks = [...subjects, ...chapters, ...topics, ...modules];

    subjects = null;
    chapters = null;
    topics = null;
    modules = null;

    fileLinks = fileLinks.filter((link) => {
      try {
        const pathname = decodeURI(new URL(link.fileurl).pathname);
        return !fs.existsSync(`./resources${pathname}`);
      } catch (err) {
        return true;
      }
    });

    return res.status(200).json({
      status: "success",
      result: fileLinks.length,
      data: {
        fileLinks,
      },
    });
  } catch (err) {
    return res.status(200).json({
      status: "fail",
      message: err.message,
    });
  }
});

/**
 * @name downloadFile
 * @description download file from aws with signed url
 */
router.post("/download-file", async (req, res) => {
  try {
    if (fs.existsSync(`./resources${req.body.filepath}`)) {
      throw {
        message:
          "File already downloaded please refresh your page to see the changes!",
      };
    }
    //get signed download url
    const signedRes = await axios.post(
      `${process.env.ORIGIN}/api/v1/modules/download-signed-url`,
      {
        filepath: req.body.filepath,
      },
      {
        headers: {
          token: req.headers.token,
        },
        validateStatus: () => true,
      }
    );

    if (signedRes.data.status !== "success") throw signedRes.data;

    const fileRes = await axios.get(signedRes.data.data.signedURL, {
      responseType: "arraybuffer",
    });

    let destination = "./resources";
    const paths = [...req.body.filepath.split("/")];
    for (let i = 1; i < paths.length - 1; i++) {
      destination = `${destination}/${paths[i]}`;
      if (fs.existsSync(`./${destination}`)) continue;
      fs.mkdirSync(`./${destination}`);
    }

    const tempFolder = `${destination}/temp`;
    const filename = paths[paths.length - 1];
    fs.mkdirSync(`${destination}/temp`);
    fs.writeFileSync(`./${tempFolder}/${filename}`, fileRes.data);
    downloadFile({
      tempDir: tempFolder,
      source: `${tempFolder}/${filename}`,
      destination: `${destination}/${filename}`,
      folder: "123456",
    });

    return res.json({
      status: "success",
      data: {
        filepath: destination,
      },
      message: "File saved successfully",
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

router.post("/upload-file", parseUploadFormData, (req, res, next) => {
  if (!fs.existsSync(`./myresources`)) fs.mkdirSync("myresources");

  const module = new models.module({
    ...req.body,
    createdAt: Date.now(),
  });
  fs.mkdirSync(`myresources/${module._id}`);
  //write directory
  const resources = [];
  req.files.forEach((file) => {
    const dir = `myresources/${module._id}/${file.filename}`;
    fs.writeFileSync(`./${dir}`, file.filevalue);
    resources.push({
      fieldName: file.fieldname,
      fileName: `${module._id}/${file.filename}`,
      fileUrl: `http://${req.get("host")}/${dir}`,
    });
  });

  module.totalResources = resources.length;
  module.resources = resources;

  return res.status(200).json({
    status: "success",
    data: {
      module,
    },
  });
});

module.exports = router;
