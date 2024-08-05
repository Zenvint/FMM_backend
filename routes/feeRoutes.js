const express = require("express");
const router = express.Router();
const feesController = require("../controllers/feesController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/")
  .get(feesController.getAllFees)
  .patch(feesController.updateFee);

router.route("/history").patch(feesController.updateHistory);

router.route("/newfeeyear").post(feesController.startNewFeeSet);

module.exports = router;
