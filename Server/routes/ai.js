const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const { CATEGORIES, getMonthlyReport, suggestIncomeType } = require("../controllers/ai");
const router = express.Router();

// Returns the list of supported categories — useful for frontend dropdowns
router.get("/categories", isAuth, (req, res) => {
  res.status(200).json({ categories: CATEGORIES });
});

router.post("/suggestincometype", isAuth, async (req, res) => {
  const { source } = req.body;
  if (!source) return res.status(400).json({ message: "Source is required" });
  const result = await suggestIncomeType(source);
  res.status(200).json(result);
});
// GET /api/ai/monthly-report?month=5&year=2026
// Returns an AI-generated plain English summary of the month
router.get("/monthly-report", isAuth, getMonthlyReport);

module.exports = router;