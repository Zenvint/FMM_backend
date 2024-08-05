const Staff = require("../models/Staff");
const Salary = require("../models/Salary");
const asyncHandler = require("express-async-handler");

// @desc Get All staff
// @route GET /staff
// @access Private
const getAllStaffs = asyncHandler(async (req, res) => {
  const staffs = await Staff.find().lean();
  if (!staffs?.length) {
    return res.status(400).json({ message: "No staffs found" });
  }

  res.json(staffs);
});

// @desc Create new staff
// @route POST /staff
// @access Private
const createNewStaff = asyncHandler(async (req, res) => {
  const { name, gender,role ,description, email, phone,  salary } = req.body;

  // Confirm Data
  if (!name || !gender || !role || !description || !email || !phone || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // create and store new expense
  const staff = await Staff.create({  name, gender,role ,description, email, phone,  salary });

  if (staff) {
    await Salary.create({staffId: staff._id, salary: staff.salary});
    res.status(201).json({ message: `New staff ${staff.name} created` });
  } else {
    res.status(400).json({ message: "Invalid staff data received" });
  }
});

// @desc Update a staff
// @route PATCH /staff
// @access Private
const updateStaff = asyncHandler(async (req, res) => {
  const { id, name, gender,role ,description, email, phone,  salary } = req.body;

  // Confirm data
  if (!id || !name || !gender || !role || !description || !email || !phone || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const staff = await Staff.findById(id).exec();

  if (!staff) {
    return res.status(400).json({ message: "Staff not found" });
  }

  staff.name = name;
  staff.gender = gender;
  staff.role = role;
  staff.description = description;
  staff.email = email;
  staff.phone = phone;
  staff.salary = salary;

  const updatedStaff = await staff.save();

  const staffsalary = await Salary.findOne({staffId: id}).exec();
  staffsalary.salary = salary
  await staffsalary.save();

  res.json({ message: `staff with Name: ${updateStaff.name} updated` });
});

// @desc delete a staff
// @route DELETE /staff
// @access Private
const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Staff ID required" });
  }

  const staff = await Staff.findById(id).exec();

  if (!staff) {
    return res.status(400).json({ message: "Staff not found" });
  }

  // deleting the associated salary
  const salary = await Salary.findOne({staffId: staff._id}).exec();

  if (!salary) {
    return res.status(400).json({message: "Salary not found"});
  }

  const delsalary = await salary.deleteOne(); 
  const result = await staff.deleteOne();

  if (!result.acknowledged || !delsalary.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Staff with ID ${staff._id} deleted`;
  res.json(reply);
});

module.exports = {
   getAllStaffs,
  createNewStaff,
  updateStaff,
  deleteStaff,
};
