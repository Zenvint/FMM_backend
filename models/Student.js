const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
  },
  classId: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  pob: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  parentname: {
    type: String,
    required: true,
  },
  parentnumber: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model("Student", studentSchema);
