const Transaction = require("../models/Transaction");
const asyncHandler = require("express-async-handler");

// @desc Get All transactions
// @route GET /transactions
// @access Private
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().lean();
  if (!transactions?.length) {
    return res.status(400).json({ message: "No transactions found" });
  }
  res.json(transactions);
});

// @desc Create new  transaction
// @route POST /transaction
// @access Private
const createNewTransaction = asyncHandler(async (req, res) => {
  const { transactiontype, amount } = req.body;

  // Confirm Data
  if (!transactiontype || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // create and store new transaction
  const transaction = await Transaction.create({ transactiontype, amount });

  if (transaction) {
    res
      .status(201)
      .json({ message: `New ${transactiontype} transaction created` });
  } else {
    res.status(400).json({ message: "Invalid transaction data received" });
  }
});

module.exports = {
  getAllTransactions,
  createNewTransaction,
};
