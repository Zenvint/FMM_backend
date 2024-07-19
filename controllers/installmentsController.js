const Installment = require("../models/Installment");
const Section = require("../models/Section");
const asyncHandler = require("express-async-handler");

// @desc Get All installments
// @route GET /installments
// @access Private
const getAllInstallments = asyncHandler(async (req, res) => {
  const installments = await Installment.find().lean();
  if (!installments?.length) {
    return res.status(400).json({ message: "No installments found" });
  }

  // Add sectionname to each installments before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const installmentsWithSectionName = await Promise.all(
    installments.map(async (installment) => {
      const section = await Section.findById(installment.sectionId).lean().exec();
      return { ...installment, sectionname: section.sectionname };
    })
  );

  res.json(installmentsWithSectionName);
});

// @desc Update a installment
// @route PATCH /installment
// @access Private
const updateInstallment = asyncHandler(async (req, res) => {
  const {
    id,
    sectionId,
    firstinstallment,
    secondinstallment,
    thirdinstallment,
  } = req.body;

  // Confirm data
  if (!id || !sectionId || !firstinstallment || !secondinstallment || !thirdinstallment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const installment = await Installment.findById(id).exec();

  if (!installment) {
    return res.status(400).json({ message: "Installment not found" });
  }

  installment.sectionId = sectionId;
  installment.firstinstallment = firstinstallment;
  installment.secondinstallment = secondinstallment;
  installment.thirdinstallment = thirdinstallment;


  const updatedInstallment = await installment.save();

  res.json({ message: `${updatedInstallment.sectionId} updated` });
});

module.exports = {
  getAllInstallments,
  updateInstallment
};
