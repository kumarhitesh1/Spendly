const express = require('express');
const { isAuth } = require('../middlewares/isAuth');
const { addExpense, getAllExpenses, downloadExpensesExcel, deleteExpense } = require('../controllers/expense');
const router = express.Router();

router.post("/add",isAuth,addExpense);
router.get("/get",isAuth,getAllExpenses);
router.get("/downloadexcel",isAuth,downloadExpensesExcel);
router.delete("/delete/:id",isAuth,deleteExpense);

module.exports = router;
