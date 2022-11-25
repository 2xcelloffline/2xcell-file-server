const router = require("express").Router();
const { default: axios } = require("axios");
const fs = require("fs");

const models = {
  subject: require("../../model/courseModels/subject"),
  chapter: require("../../model/courseModels/chapter"),
  topic: require("../../model/courseModels/topic"),
  module: require("../../model/courseModels/module"),
};
const origin = "http://127.0.0.1:5000";
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
        const pathname = new URL(link.fileurl).pathname;
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
router.get("/download-file", async (req, res) => {
  try {
    //get signed download url
    const signedRes = await axios.get(
      `${origin}/api/v1/modules/download-signed-url?filepath=${req.query.filepath}`,
      {
        headers: {
          token: req.headers.token,
        },
        validateStatus: () => true,
      }
    );

    if (signedRes.data.status !== "success") throw signedRes.data;

    const fileRes = await axios.get(signedRes.data.data.signedURL, {
      responseType: "blob",
    });

    fs.writeFileSync(`./resources/${req.query.filepath}`, fileRes.data);

    return res.json({
      status: "done",
      message: "File saved successfully",
    });
  } catch (err) {

    console.log(err);
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

module.exports = router;
