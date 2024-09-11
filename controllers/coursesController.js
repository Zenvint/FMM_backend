const Class = require("../models/Class");
const Section = require("../models/Section");
const User = require("../models/User");
const Course = require("../models/Course");
const asyncHandler = require("express-async-handler");

// @desc Get All courses
// @route GET /courses
// @access Private
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().lean();
  if (!courses?.length) {
    return res.status(400).json({ message: "No courses found" });
  }

  // Add sectionname, teachername, classname to each class before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const coursesWithUser = await Promise.all(
    courses.map(async (course) => {
      const section = await Section.findById(course.sectionId).lean().exec();
      const classObject = await Class.findById(course.classId).lean().exec();
      const teacher = await User.findById(course.teacherId).lean().exec();
      return { ...course, sectionname: section.sectionname , classname: classObject.classname, teachername: teacher.email};
    })
  );

  res.json(coursesWithUser);
});

// @desc Create new class
// @route POST /class
// @access Private
const createNewCourse = asyncHandler(async (req, res) => {
  const {title , sectionId, classId, teacherId } = req.body;

  // Confirm Data
  if (!title || !sectionId || !classId || !teacherId ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates
  const duplicate = await Course.findOne({ title: new RegExp('^' + title.toLowerCase(), 'i') })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate course name" });
  }

  // create and store new course
  const course = await Course.create({ title, sectionId, classId, teacherId });

  if (course) {
    res.status(201).json({ message: `New class ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid course data received" });
  }
});

// @desc Update a course
// @route PATCH /courses
// @access Private
const updateCourse = asyncHandler(async (req, res) => {
  const { id, title, sectionId ,classId, teacherId} = req.body;

  // Confirm data
  if (!id || !title || !sectionId || !classId || !teacherId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const course = await Course.findById(id).exec();

  if (!course) {
    return res.status(400).json({ message: "Class not found" });
  }

  // check for duplicate
  const duplicate = await Course.findOne({ title: new RegExp('^' + title.toLowerCase(), 'i') })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate course" });
  }

  course.title = title
  course.sectionId = sectionId
  course.classId = classId
  course.teacherId = teacherId

  const updatedCourse = await course.save();

  res.json({ message: `${updatedCourse.title} updated` });
});

// @desc delete a course
// @route DELETE /courses
// @access Private
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Course ID required" });
  }

  const course = await Course.findById(id).exec();

  if (!course) {
    return res.status(400).json({ message: "Course not found" });
  }

  const result = await course.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Course name ${course.title} with ID ${course._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllCourses,
  createNewCourse,
  updateCourse,
  deleteCourse,
};
