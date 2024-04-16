const express = require("express");
const router = express.Router();
const sectionsController = require('../controllers/sectionsController')

router.route("/")
    .get(sectionsController.getAllSections)
    .post(sectionsController.createNewSection)
    .patch(sectionsController.updateSection)
    .delete(sectionsController.deleteSection)

module.exports = router;
