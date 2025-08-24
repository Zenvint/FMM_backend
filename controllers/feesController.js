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
      // Defensive lookups: a related document might be missing
      const student = fee.studentId
        ? await Student.findById(fee.studentId).lean().exec()
        : null;
      const section = student?.sectionId
        ? await Section.findById(student.sectionId).lean().exec()
        : null;
      const installment = section?._id
        ? await Installment.findOne({ sectionId: section._id }).lean().exec()
        : null;
      const classobj = student?.classId
        ? await Class.findById(student.classId).lean().exec()
        : null;

      return {
        ...fee,
        matricule: student?.matricule ?? null,
        studentname: student?.fullname ?? null,
        sectionname: section?.sectionname ?? null,
        classname: classobj?.classname ?? null,
        installmentId: installment?._id ?? null,
        tuition: classobj?.tuition ?? null,
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

  res.json({
    message: `fee with studentId: ${updatedFee.studentId} updated`,
    updatedFee,
  });
});

// @desc Update a fee's history for a year
// @route PATCH /fee/history
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

  res.json({
    message: `fee history for studentId: ${updatedFee.studentId} updated`,
    updatedFee,
  });
});

// @desc POST a fee - start a new academic year for all fees
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
    const student = fee.studentId
      ? await Student.findById(fee.studentId).lean().exec()
      : null;
    const classobj = student?.classId
      ? await Class.findById(student.classId).lean().exec()
      : null;
    const section = student?.sectionId
      ? await Section.findById(student.sectionId).lean().exec()
      : null;

    // Capture the current values and related info into the year's history
    const newhistory = {
      amountPaid: fee.amountPaid,
      balance: fee.balance,
      discount: fee.discount,
      status: fee.status,
      registrationfee: fee.registrationfee,
      sectionname: section?.sectionname ?? null,
      classname: classobj?.classname ?? null,
      tuition: classobj?.tuition ?? null,
    };

    // Reset the current fee data for the new academic year
    fee.amountPaid = 0;
    fee.balance = classobj?.tuition ?? fee.balance; // fall back to existing balance if class not found
    fee.discount = 0;
    fee.status = false;
    fee.registrationfee = false; // <-- newly added: reset registration status to false for new year

    // Add to history
    fee.history = { ...fee.history, [yearstring]: newhistory };

    await fee.save();
  }

  res.json({ message: `process successful` });
});

module.exports = {
  getAllFees,
  updateFee,
  updateHistory,
  startNewFeeSet,
};
