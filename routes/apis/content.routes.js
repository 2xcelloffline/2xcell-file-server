const router = require("express").Router();
const axios = require("axios");

const models = {
  course: require("../../model/courseModels/course"),
  subject: require("../../model/courseModels/subject"),
  chapter: require("../../model/courseModels/chapter"),
  topic: require("../../model/courseModels/topic"),
  module: require("../../model/courseModels/module"),
};

router.get("/sync-course-contents", async (req, res) => {
  const state = {
    courses: {
      inserted: 0,
      message: "",
    },
    subjects: {
      inserted: 0,
      message: "",
    },
    chapters: {
      inserted: 0,
      message: "",
    },
    topics: {
      inserted: 0,
      message: "",
    },
    modules: {
      inserted: 0,
      message: "",
    },
  };

  for await (let model of Object.keys(models)) {
    try {
      const res = await axios.get(`${process.env.ORIGIN}/api/v1/course-sync/${model}s`, {
        headers: {
          token: req.headers.token,
        },
        validateStatus: () => true,
      });
      if (res.data.status !== "success") throw res.data;
      console.log(`FETCHED: ${res.data.result} ${model}s`);

      const query = {};
      //delete only admin module
      if (model === "module") query["onModel"] = "admin";
      //clear old data
      await models[model].deleteMany(query);
      //insert new data
      await models[model].insertMany(res.data.data[`${model}s`], {
        ordered: false,
      });

      state[`${model}s`].inserted = res.data.result;
      console.log(`INSERTED: ${model}s data!`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      state[`${model}s`].message = err.message;
    }
    console.log("------");
  }

  return res.status(200).json({
    status: "success",
    message: "Content Synced Successfully",
    data: {
      state,
    },
  });
});

module.exports = router;