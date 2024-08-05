const express = require("express");
const router = express.Router();
const salariesController = require("../controllers/salariesController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/")
  .get(salariesController.getAllSalaries)
  .patch(salariesController.updateSalary);

router.route("/history").patch(salariesController.updateHistory);

router.route("/newsalarymonth").post(salariesController.startNewSalaryMonth);

module.exports = router;
