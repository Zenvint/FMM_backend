const Staff = require("../models/Staff");
const Salary = require("../models/Salary");
const asyncHandler = require("express-async-handler");
const moment = require('moment');
// @desc Get All salaries
// @route GET /salaries
// @access Private
const getAllSalaries = asyncHandler(async (req, res) => {
  const salaries = await Salary.find().lean();
  if (!salaries?.length) {
    return res.status(400).json({ message: "No salary found" });
  }

  // Add dependent data to each salary before sending the response
  const salarieswithdependent = await Promise.all(
    salaries.map(async (salary) => {
      const staff = await Staff.findById(salary.staffId).lean().exec();
      return {
        ...salary,
        name: staff.name,
        role: staff.role,
        createdOn: moment(salary.createdAt).format('YYYY-MM-DD')
      };
    })
  );

  res.json(salarieswithdependent);
});

// @desc Update a salary
// @route PATCH /salary
// @access Private
const updateSalary = asyncHandler(async (req, res) => {
  const { id, staffId, salary, status } = req.body;
  // Confirm data
  if (!id || typeof status !== "boolean" || !salary || !staffId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const salaryObj = await Salary.findById(id).exec();

  if (!salaryObj) {
    return res.status(400).json({ message: "salary not found" });
  }

  salaryObj.staffId = staffId;
  salaryObj.salary = salary;
  salaryObj.status = status;

  const updatedSalary = await salaryObj.save();

  res.json({
    message: `salary with staffId: ${updatedSalary.staffId} updated`,
  });
});


// @desc Update a fee
// @route PATCH /fee
// @access Private
const updateHistory = asyncHandler(async (req, res) => {
  const { id, datestring ,status } = req.body;
  // Confirm data
  if (
    !id ||
    !datestring ||
    typeof status !== "boolean" 
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const salary = await Salary.findById(id).exec();

  if (!salary) {
    return res.status(400).json({ message: "salary not found" });
  }

  const record = { salary: salary.salary, status };
  salary.history = { ...salary.history, [datestring]: record };

  const updatedSalary = await salary.save();

  res.json({ message: `salary with staffId: ${updatedSalary.staffId} updated` });
});


// @desc POST a fee
// @route POST /startmonth
// @access Private
const startNewSalaryMonth = asyncHandler(async (req, res) => {
  const { datestring } = req.body;
  // Confirm data
  if (!datestring) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const salaries = await Salary.find().exec();
  if (!salaries?.length) {
    return res.status(400).json({ message: "No salaries fee records found" });
  }

  for (const salary of salaries) {
    const newhistory = {
      salary: salary.salary,
      status: salary.status,
    };

    //set the curent data to new values
    salary.status = false;
    salary.history = { ...salary.history, [datestring]: newhistory };

    const updatefee = await salary.save();
  }

  res.json({ message: `process successful` });
});

module.exports = {
  getAllSalaries,
  updateSalary,
  updateHistory,
  startNewSalaryMonth
};
