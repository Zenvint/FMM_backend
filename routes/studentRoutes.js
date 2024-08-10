const express = require("express");
const router = express.Router();
const studentsController = require("../controllers/studentsController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(studentsController.getAllStudents)
  .post(studentsController.createNewStudent)
  .patch(studentsController.updateStudent)
  .delete(studentsController.deleteStudent);

router.route("/dismiss").patch(studentsController.dismissedStudent);

module.exports = router;
