const express = require("express");
const {
  addIncome,
  getAllIncomes,
  deleteIncome,
  downloadIncomeExcel,
  getIncomeByMonth,
} = require("../controllers/income");
const { isAuth } = require("../middlewares/isAuth");
const router = express.Router();

router.post("/add", isAuth, addIncome);
router.get("/get", isAuth, getAllIncomes);
router.get("/downloadexcel", isAuth, downloadIncomeExcel);
router.delete("/delete/:id", isAuth, deleteIncome);
router.get("/getbymonth", isAuth, getIncomeByMonth);

module.exports = router;
