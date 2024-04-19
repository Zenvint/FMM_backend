const express = require("express");
const router = express.Router();
const classesController = require("../controllers/classesController")

router.route('/')
    .get(classesController.getAllClasses)
    .post(classesController.createNewClass)
    .patch(classesController.updateClass)
    .delete(classesController.deleteClass)

module.exports = router