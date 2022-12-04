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
  section: require("../../model/schoolModels/gradeSections"),
  task: require("../../model/schoolModels/task"),
  submission: require("../../model/schoolModels/submissions"),
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
    if (!req.body.filepath) {
      throw {
        message: "File path not provded!",
      };
    }
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

    if (!fs.existsSync(destination)) {
      fs.mkdirSync("resources");
    }

    const paths = [...req.body.filepath.split("/")];
    for (let i = 1; i < paths.length - 1; i++) {
      destination = `${destination}/${paths[i]}`;
      if (fs.existsSync(`${destination}`)) continue;
      fs.mkdirSync(`${destination}`);
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

router.post("/upload-file", parseUploadFormData, async (req, res, next) => {
  try {
    if (!fs.existsSync(`./myresources`)) fs.mkdirSync("myresources");

    const gradeSection = await models.section.findOne({
      _id: req.body.sectionId,
    });

    const module = new models.module({
      topicId: req.body.topicId,
      name: req.body.name,
      school: gradeSection.schoolId,
      section: `${gradeSection.grade}-${gradeSection.section}`,
      onModel: "staff",
      creator: req.query.userId,
      public: false,
      createdAt: Date.now(),
      lang: ["english", "hindi"].includes(req.body.lang)
        ? req.body.lang
        : "english",
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

      if (file.fieldname === "thumbnail") {
        module.thumbnail = `http://${req.get("host")}/${dir}`;
      }
    });

    module.totalResources = resources.length;
    module.resources = resources;

    await module.save();

    //create task
    if (["true", true].includes(req.body.makeTask)) {
      //populate fiels
      await models.module.populate(module, {
        path: "topicId",
        select: "name chapterId",
        populate: {
          path: "chapterId",
          select: "name subjectId",
          populate: {
            path: "subjectId",
            select: "name",
          },
        },
      });

      const currentDate = Date.now();
      const startDate = req.body.startDate || currentDate;
      var lastDate = req.body.lastDate || startDate + 24 * 60 * 60 * 1000;

      //if last date is equal to start date then add add 23hour in lastDate
      if (lastDate === startDate) {
        lastDate = new Date(startDate).getTime() + 23 * 60 * 60 * 1000;
      }

      if (lastDate < startDate) {
        return res.status(400).json({
          status: "success",
          message: "Task end date should be greater than start date",
        });
      }

      await models.task.create({
        content: module._id,
        submission: req.body.submission,
        taskType: req.body.taskType,
        onModel: req.body.contentType,
        school: gradeSection.schoolId,
        section: `${gradeSection.grade}-${gradeSection.section}`,
        subject: module?.topicId?.chapterId?.subjectId?.name,
        chapter: module?.topicId?.chapterId?.name,
        topic: module?.topicId?.name,
        creator: req.query.userId,
        createdAt: currentDate,
        from: startDate,
        to: lastDate,
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        module,
      },
    });
  } catch (err) {
    return res.status(200).json({
      status: "fail",
      message: "Error in file uploading",
    });
  }
});

router.post(
  "/task-submission/:taskId",
  parseUploadFormData,
  async (req, res, next) => {
    try {
      const task = await models.task
        .findOne({
          _id: req.params.taskId,
          submittedBy: { $nin: req.query.userId },
        })
        .populate("content", "+correctAnswers");

      if (!task) throw { message: "Task already submitted or not found!" };
      if (!task.submission) throw { message: "Submission not enabled!" };
      if (new Date(task.from).getTime() >= Date.now())
        throw { message: "Please wait! submission not started!" };

      const file = req.files[0];
      if (!file) {
        return res.status(200).json({
          status: "success",
          message: "Please upload file!",
        });
      }

      const submission = new models.submission.Submission({
        userId: req.query.userId,
        taskId: task._id,
        submittedAt: Date.now(),
      });

      submission.setSubmitStatus(task.to, submission.submittedAt);
      //upload student pdf content
      const submPath = `./myresources/${submission._id}`;
      fs.mkdirSync(submPath); //create submission folder
      fs.writeFileSync(`${submPath}/${file.filename}`, file.filevalue);
      submission.resources = [
        {
          fileName: file.filename,
          fieldName: file.fieldname,
          fileUrl: `http://${req.get("host")}/myresources/${
            submission._id
          }/${file.filename}`,
        },
      ];

      submission.lastDeleteTime = task.to;
      task.submittedBy.push(req.query.userId);
      await submission.save();
      await task.save({ validateBeforeSave: false });
      //return response to
      return res.status(200).json({
        status: "success",
        data: { submission },
      });
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
  }
);

module.exports = router;
