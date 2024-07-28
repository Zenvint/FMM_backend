const Staff = require("../models/Staff");
const Salary = require("../models/Salary");
const asyncHandler = require("express-async-handler");

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

module.exports = {
  getAllSalaries,
  updateSalary,
};
