const Class = require("../models/Class");
const Fee = require("../models/Fee");
const moment = require('moment');
const Section = require("../models/Section");
const Student = require("../models/Student");
const asyncHandler = require("express-async-handler");

// @desc Get All students
// @route GET /students
// @access Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().lean();
  if (!students?.length) {
    return res.status(400).json({ message: "No students found" });
  }

  // Add sectionname and classname to each student before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const studentsWithSection_class = await Promise.all(
    students.map(async (student) => {
      const section = await Section.findById(student.sectionId).lean().exec();
      const classObj = await Class.findById(student.classId).lean().exec();
      return { ...student, sectionname: section.sectionname, classname: classObj.classname, dobformated: moment(student.dob).format('YYYY-MM-DD'), createdOn:moment(student.createdAt).format('YYYY-MM-DD')  };
    })
  );

  res.json(studentsWithSection_class);
});

// @desc Create new  student
// @route POST /student
// @access Private
const createNewStudent = asyncHandler(async (req, res) => {
  const {matricule, fullname , sectionId, classId,dob, pob, nationality, gender, parentname, parentnumber} = req.body;

  // Confirm Data
  if (!matricule || !fullname || !sectionId || !classId || !dob || !pob || !nationality || !gender || !parentname || !parentnumber ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates
  const duplicate = await Student.findOne({ matricule: new RegExp('^' + matricule.toLowerCase(), 'i') })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Student Matricule" });
  }

  // create and store new student
  const student = await Student.create({ matricule, fullname , sectionId, classId,dob, pob, nationality, gender, parentname, parentnumber });

  if (student) {
    const classObj = await Class.findById(student.classId).exec();
    await Fee.create({studentId: student._id, balance: classObj.tuition});
    res.status(201).json({ message: `New Student ${matricule} created` });
  } else {
    res.status(400).json({ message: "Invalid student data received" });
  }
});



// @desc Update a student
// @route PATCH /student
// @access Private
const updateStudent = asyncHandler(async (req, res) => {
  const { id , matricule ,fullname , sectionId, classId,dob, pob, nationality, gender, parentname, parentnumber} = req.body;

  // Confirm data
  if (!id || !matricule || !fullname || !sectionId || !classId || !dob || !pob || !nationality || !gender || !parentname || !parentnumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  // check for duplicate
  const duplicate = await Student.findOne({ matricule: new RegExp('^' + matricule.toLowerCase(), 'i') })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Student" });
  }

  student.fullname = fullname;
  student.sectionId = sectionId;
  student.classId = classId;
  student.dob = dob;
  student.pob = pob;
  student.nationality = nationality;
  student.gender = gender;
  student.parentname = parentname;
  student.parentnumber = parentnumber;

  const updatedStudent = await student.save();

  // ajusting the fee to match that of the new class

  const fee = await Fee.findOne({studentId: id}).exec();
  const classObj = await Class.findById(classId).exec();
  const tuition = classObj.tuition;
  const currentAmountPaid = fee.amountPaid;
  const currentBalance = fee.balance;

  const difference = tuition - (currentAmountPaid + currentBalance)
  const newbalance = currentBalance + difference;

  fee.balance = newbalance;
  if (newbalance === 0){
    fee.status = true;
  }else {
    fee.status = false;
  }

  await fee.save();

  res.json({ message: `${updatedStudent.matricule} updated` });
});

// @desc Update a student
// @route PATCH /student
// @access Private
const dismissedStudent = asyncHandler(async (req, res) => {
  const { id , dismissed, dismissalreason} = req.body;

  // Confirm data
  if (!id || typeof dismissed  !== "boolean" ||  typeof dismissalreason  !== "string") {
    return res.status(400).json({ message: "All fields are required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }


  student.dismissed = dismissed;
  student.dismissalreason = dismissalreason;
 
  const updatedStudent = await student.save();

  res.json({ message: `${updatedStudent.matricule} updated` });
});

// @desc delete a student
// @route DELETE /student
// @access Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  // get and delete the corresponding fee
  const fee = await Fee.findOne({studentId: id}).exec();

  if (!fee) {
    return res.status(400).json({ message: "fee not found" });
  } 
  
  const delfee = await fee.deleteOne();
  const result = await student.deleteOne();

  if (!result.acknowledged || !delfee.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Student matricule ${student.matricule} with ID ${student._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllStudents,
  createNewStudent,
  updateStudent,
  deleteStudent,
  dismissedStudent
};
