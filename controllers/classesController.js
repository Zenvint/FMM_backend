const Class = require("../models/Class");
const Student = require("../models/Student");
const Section = require("../models/Section");
const asyncHandler = require("express-async-handler");

// @desc Get All classes
// @route GET /classes
// @access Private
const getAllClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find().lean();
  if (!classes?.length) {
    return res.status(400).json({ message: "No classes found" });
  }

  // Add sectionname to each class before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const classesWithUser = await Promise.all(
    classes.map(async (classObject) => {
      const section = await Section.findById(classObject.sectionId).lean().exec();
      return { ...classObject, sectionname: section.sectionname };
    })
  );

  res.json(classesWithUser);
});

// @desc Create new class
// @route POST /class
// @access Private
const createNewClass = asyncHandler(async (req, res) => {
  const {classname , sectionId, tuition } = req.body;

  // Confirm Data
  if (!classname || !sectionId || !tuition ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates
  const duplicate = await Class.findOne({ classname: new RegExp('^' + classname.toLowerCase(), 'i') })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate class name" });
  }

  // create and store new class
  const classObject = await Class.create({ classname, sectionId, tuition });

  if (classObject) {
    res.status(201).json({ message: `New class ${classname} created` });
  } else {
    res.status(400).json({ message: "Invalid class data received" });
  }
});

// @desc Update a class
// @route PATCH /class
// @access Private
const updateClass = asyncHandler(async (req, res) => {
  const { id, classname, sectionId ,tuition} = req.body;

  // Confirm data
  if (!id || !classname || !sectionId || !tuition) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const classObject = await Class.findById(id).exec();

  if (!classObject) {
    return res.status(400).json({ message: "Class not found" });
  }

  // check for duplicate
  const duplicate = await Class.findOne({ classname: new RegExp('^' + classname.toLowerCase(), 'i') })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate class" });
  }

  classObject.classname = classname;
  classObject.sectionId = sectionId;
  classObject.tuition = tuition;

  const updatedClass = await classObject.save();

  res.json({ message: `${updatedClass.classname} updated` });
});

// @desc delete a class
// @route DELETE /class
// @access Private
const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Class ID required" });
  }

  // check for dependent students
  const student = await Student.findOne({ classsId: id }).lean().exec();

  if (student) {
    return res.status(400).json({ message: "Class has assigned students, please remove all dependent students and try again" });
  }

  const classObject = await Class.findById(id).exec();

  if (!classObject) {
    return res.status(400).json({ message: "Class not found" });
  }

  const result = await classObject.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Class name ${classObject.classname} with ID ${classObject._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllClasses,
  createNewClass,
  updateClass,
  deleteClass,
};
