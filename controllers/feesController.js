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

// @desc Update a fee
// @route PATCH /fee
// @access Private
const updateHistory = asyncHandler(async (req, res) => {
  const { id, yearstring, discount, balance, amountPaid, status } = req.body;
  // Confirm data
  if (
    !id ||
    !yearstring ||
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

  const record = { amountPaid, balance, discount, status };
  fee.history = { ...fee.history, [yearstring]: record };

  const updatedFee = await fee.save();

  res.json({ message: `fee with studentId: ${updateFee.studentId} updated` });
});

// @desc POST a fee
// @route POST /startyear
// @access Private
const startNewFeeSet = asyncHandler(async (req, res) => {
  const { yearstring } = req.body;
  // Confirm data
  if (!yearstring) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const fees = await Fee.find().exec();
  if (!fees?.length) {
    return res.status(400).json({ message: "No student fee records found" });
  }

  for (const fee of fees) {
    const student = await Student.findById(fee.studentId).lean().exec();
    const classobj = await Class.findById(student.classId).lean().exec();
    const section = await Section.findById(student.sectionId).lean().exec();

    const newhistory = {
      amountPaid: fee.amountPaid,
      balance: fee.balance,
      discount: fee.discount,
      status: fee.status,
      sectionname: section.sectionname,
      classname: classobj.classname
    };

    //set the curent data to new values
    fee.amountPaid = 0;
    fee.balance = classobj.tuition;
    fee.discount = 0;
    fee.status = false;
    fee.history = { ...fee.history, [yearstring]: newhistory };

    const updatefee = await fee.save();
  }

  res.json({ message: `process successful` });
});

module.exports = {
  getAllFees,
  updateFee,
  updateHistory,
  startNewFeeSet,
};
