const { suggestCategory } = require("./ai");

const Expense = require("../models/expense");

const xlsx = require("xlsx");

// Add new expense
async function addExpense(req, res) {
  const userId = req.user._id;

  try {
    const { icon, category, amount, date, description } = req.body;

    // Validate required fields
    if (!amount || !date) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    let finalCategory = category;

    let finalIcon = icon;

    // Detect category using AI
    if (!finalCategory && description) {
      const aiResult = await suggestCategory(description, amount);

      finalCategory = aiResult.category;

      if (!finalIcon) {
        finalIcon = aiResult.icon;
      }
    }

    // Validate category
    if (!finalCategory) {
      return res.status(400).json({
        message: "Please provide a category or a description",
      });
    }

    // Create expense
    const newExpense = new Expense({
      userId,

      icon: finalIcon,

      category: finalCategory,

      amount,

      date: new Date(date),

      description: description || "",
    });

    await newExpense.save();

    res.status(200).json({
      newExpense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Get all expenses
async function getAllExpenses(req, res) {
  const userId = req.user._id;

  try {
    const expenses = await Expense.find({
      userId,
    }).sort({
      date: -1,
    });

    res.status(200).json({
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Download expenses as Excel
async function downloadExpensesExcel(req, res) {
  const userId = req.user._id;

  try {
    const expense = await Expense.find({
      userId,
    }).sort({
      date: -1,
    });

    // Format Excel data
    const excelData = expense.map((item) => ({
      Category: item.category,

      Description: item.description || "",

      Amount: item.amount,

      Date: new Date(item.date).toLocaleDateString("en-IN"),
    }));

    const workbook = xlsx.utils.book_new();

    const worksheet = xlsx.utils.json_to_sheet(excelData);

    xlsx.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=expenses.xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Delete expense
async function deleteExpense(req, res) {
  const expenseId = req.params.id;

  try {
    await Expense.findByIdAndDelete(expenseId);

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  addExpense,
  getAllExpenses,
  downloadExpensesExcel,
  deleteExpense,
};
