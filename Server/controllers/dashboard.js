const Income = require("../models/income");
const Expense = require("../models/expense");
const { Types } = require("mongoose");

// Get dashboard data
async function getDashboardData(req, res) {
  try {
    const userId = req.user._id;

    const userObjectId = new Types.ObjectId(userId);

    const now = new Date();

    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const last60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Fetch dashboard queries
    const [
      totalIncomeResult,
      totalExpenseResult,
      last60DaysIncomeTransactions,
      last30DaysExpenseTransactions,
      lastIncomes,
      lastExpenses,
    ] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: userObjectId,
          },
        },

        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
          },
        },

        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Income.find({
        userId: userObjectId,
        date: { $gte: last60 },
      }).sort({
        date: -1,
      }),

      Expense.find({
        userId: userObjectId,
        date: { $gte: last30 },
      }).sort({
        date: -1,
      }),

      Income.find({
        userId: userObjectId,
      })
        .sort({ date: -1 })
        .limit(5),

      Expense.find({
        userId: userObjectId,
      })
        .sort({ date: -1 })
        .limit(5),
    ]);

    const totalIncome = totalIncomeResult[0]?.total || 0;

    const totalExpense = totalExpenseResult[0]?.total || 0;

    // Calculate recent totals
    const expenseLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    // Merge recent transactions
    const lastTransactions = [
      ...lastIncomes.map((txn) => ({
        ...txn.toObject(),
        type: "Income",
      })),

      ...lastExpenses.map((txn) => ({
        ...txn.toObject(),
        type: "Expense",
      })),
    ].sort((a, b) => b.date - a.date);

    res.status(200).json({
      totalBalance: totalIncome - totalExpense,

      totalIncome,
      totalExpense,

      last30DaysExpenses: {
        total: expenseLast30Days,
        transactions: last30DaysExpenseTransactions,
      },

      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },

      recentTransactions: lastTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  getDashboardData,
};
