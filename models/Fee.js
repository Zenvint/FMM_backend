const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    registrationfee: {
      type: Boolean,
      default: false,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fee", feeSchema);
