const express = require("express");
const router = express.Router();
const installmentsController = require('../controllers/installmentsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route("/")
    .get(installmentsController.getAllInstallments)
    .patch(installmentsController.updateInstallment)

module.exports = router;
