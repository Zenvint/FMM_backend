const express = require("express");
const router = express.Router();
const staffsController = require('../controllers/staffController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route("/")
    .get(staffsController.getAllStaffs)
    .post(staffsController.createNewStaff)
    .patch(staffsController.updateStaff)
    .delete(staffsController.deleteStaff)

module.exports = router;
