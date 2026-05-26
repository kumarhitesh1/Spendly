const User = require("../models/user");

const Income = require("../models/income");

const xlsx = require("xlsx");

// Add new income
async function addIncome(req, res) {
  const userId = req.user._id;

  try {
    const { icon, source, type, amount, date } = req.body;

    // Validate required fields
    if (!amount || !source || !date) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    // Create income
    const newIncome = new Income({
      userId,

      icon,

      source,

      type: type || "Other",

      amount,

      date: new Date(date),
    });

    await newIncome.save();

    res.status(200).json({
      newIncome,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Get all incomes
async function getAllIncomes(req, res) {
  const userId = req.user._id;

  try {
    const income = await Income.find({
      userId,
    }).sort({
      date: -1,
    });

    res.status(200).json({
      income,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Download income as Excel
async function downloadIncomeExcel(req, res) {
  const userId = req.user._id;

  try {
    const income = await Income.find({
      userId,
    }).sort({
      date: -1,
    });

    // Format Excel data
    const excelData = income.map((item) => ({
      Source: item.source,

      Type: item.type || "Other",

      Amount: item.amount,

      Date: new Date(item.date).toLocaleDateString("en-IN"),
    }));

    const workbook = xlsx.utils.book_new();

    const worksheet = xlsx.utils.json_to_sheet(excelData);

    xlsx.utils.book_append_sheet(workbook, worksheet, "Income");

    const buffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=income.xlsx");

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

// Delete income
async function deleteIncome(req, res) {
  const incomeId = req.params.id;

  try {
    await Income.findOneAndDelete(incomeId);

    res.status(200).json({
      message: "Income deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Get income by month
async function getIncomeByMonth(req, res) {
  const userId = req.user._id;

  try {
    const { month, year } = req.query;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch monthly income
    const income = await Income.find({
      userId,

      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({
      date: -1,
    });

    // Calculate total income
    const total = income.reduce((sum, i) => sum + i.amount, 0);

    // Group income by type
    const byType = {};

    income.forEach((i) => {
      const t = i.type || "Other";

      byType[t] = (byType[t] || 0) + i.amount;
    });

    res.status(200).json({
      income,
      total,
      byType,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  addIncome,
  getAllIncomes,
  downloadIncomeExcel,
  deleteIncome,
  getIncomeByMonth,
};
