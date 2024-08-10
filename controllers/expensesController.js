const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");
const moment = require('moment');
// @desc Get All expenses
// @route GET /expenses
// @access Private
const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find().lean();
  if (!expenses?.length) {
    return res.status(400).json({ message: "No expenses found" });
  }

  const expenseswithdependency = await Promise.all(
    expenses.map(async (expense) => {
     
      return {
        ...expense,
        createdOn: moment(expense.createdAt).format('YYYY-MM-DD')
      };
    })
  );

  res.json(expenseswithdependency);
});

// @desc Create new expense
// @route POST /expense
// @access Private
const createNewExpense = asyncHandler(async (req, res) => {
  const { benefactor, descriptions, amount } = req.body;

  // Confirm Data
  if (!benefactor || !descriptions || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // create and store new expense
  const expense = await Expense.create({ benefactor, descriptions, amount });

  if (expense) {
    res.status(201).json({ message: `New expense created` });
  } else {
    res.status(400).json({ message: "Invalid expense data received" });
  }
});

// @desc Update a expense
// @route PATCH /expense
// @access Private
const updateExpense = asyncHandler(async (req, res) => {
  const { id, benefactor, descriptions, amount } = req.body;

  // Confirm data
  if (!id || !benefactor || !descriptions || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const expense = await Expense.findById(id).exec();

  if (!expense) {
    return res.status(400).json({ message: "Expense not found" });
  }

  expense.benefactor = benefactor;
  expense.descriptions = descriptions;
  expense.amount = amount;

  const updatedExpense = await expense.save();

  res.json({ message: `expense updated` });
});

// @desc delete a expense
// @route DELETE /expense
// @access Private
const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Expense ID required" });
  }

  const expense = await Expense.findById(id).exec();

  if (!expense) {
    return res.status(400).json({ message: "Expense not found" });
  }
  const result = await expense.deleteOne();

  if (!result.acknowledged) {
    return res.status(400).json({ message: "error occured, try again" });
  }

  const reply = `Expense with ID ${expense._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllExpenses,
  createNewExpense,
  updateExpense,
  deleteExpense,
};
