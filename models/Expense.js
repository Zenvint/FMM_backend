const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    benefactor: {
      type: String,
      required: true,
    },
    descriptions: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
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

module.exports = mongoose.model("Expense", expenseSchema);
