const Section = require("../models/Section");
const asyncHandler = require("express-async-handler");



// @desc Get All sections
// @route GET /sections
// @access Private
const getAllSections = asyncHandler(async (req, res) => {
  const sections = await Section.find().lean();
  if (!sections?.length) {
    return res.status(400).json({ message: "No sections found" });
  }

  res.json(sections);
});

// @desc Create new sections
// @route POST /sections
// @access Private
const createNewSection = asyncHandler(async (req, res) => {
  const { sectionname} = req.body;

  // Confirm Data
  if (!sectionname) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates
  const duplicate = await Section.findOne({ sectionname })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate section name" });
  }

  // create and store new user
  const section = await Section.create({sectionname});

  if (section) {
    res.status(201).json({ message: `New section ${sectionname} created` });
  } else {
    res.status(400).json({ message: "Invalid section data received" });
  }
});

// @desc Update a sections
// @route PATCH /sections
// @access Private
const updateSection = asyncHandler(async (req, res) => {
  const { id, sectionname} = req.body;

  // Confirm data
  if (
    !id ||
    !sectionname 
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const section = await Section.findById(id).exec();

  if (!section) {
    return res.status(400).json({ message: "Section not found" });
  }

  // check for duplicate
  const duplicate = await Section.findOne({ sectionname })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to original section
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate section" });
  }

  section.sectionname = sectionname;
  
  const updatedSection = await section.save();

  res.json({ message: `${updatedSection.sectionname} updated` });
});

// @desc delete a sections
// @route DELETE /sections
// @access Private
const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Section ID required" });
  }

  const section = await Section.findById(id).exec();

  if (!section) {
    return res.status(400).json({ message: "Section not found" });
  }

  const result = await section.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Section name ${section.sectionname} with ID ${section._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllSections,
  createNewSection,
  updateSection,
  deleteSection,
};
