const Installment = require("../models/Installment");
const Section = require("../models/Section");
const Student = require("../models/Student");
const Fee = require("../models/Fee");
const Class = require("../models/Class");
const asyncHandler = require("express-async-handler");

// @desc Get All fees
// @route GET /fees
// @access Private
const getAllFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find().lean();
  if (!fees?.length) {
    return res.status(400).json({ message: "No fees found" });
  }

  // Add dependent data to each fee before sending the response
  const feewithdependent = await Promise.all(
    fees.map(async (fee) => {
      const student = await Student.findById(fee.studentId).lean().exec();
      const section = await Section.findById(student.sectionId).lean().exec();
      const installment = await Installment.findOne({ sectionId: section._id })
        .lean()
        .exec();
      const classobj = await Class.findById(student.classId).lean().exec();
      return {
        ...fee,
        matricule: student.matricule,
        studentname: student.fullname,
        sectionname: section.sectionname,
        classname: classobj.classname,
        installmentId: installment._id,
        tuition: classobj.tuition,
      };
    })
  );

  res.json(feewithdependent);
});

// @desc Update a fee
// @route PATCH /fee
// @access Private
const updateFee = asyncHandler(async (req, res) => {
  const { id, registrationfee, amountPaid, balance, status, discount } =
    req.body;

  console.log(req.body)
  // Confirm data
  if (
    !id ||
    typeof registrationfee !== "boolean" ||
    typeof amountPaid !== "number" ||
    typeof balance !== "number" ||
    typeof status !== "boolean" ||
    typeof discount !== "number"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const fee = await Fee.findById(id).exec();

  if (!fee) {
    return res.status(400).json({ message: "fee not found" });
  }

  fee.registrationfee = registrationfee;
  fee.amountPaid = amountPaid;
  fee.balance = balance;
  fee.status = status;
  fee.discount = discount;

  const updatedFee = await fee.save();

  res.json({ message: `fee with studentId: ${updateFee.studentId} updated` });
});

module.exports = {
  getAllFees,
  updateFee,
};
