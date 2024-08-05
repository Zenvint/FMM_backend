const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    history: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Salary", salarySchema);
