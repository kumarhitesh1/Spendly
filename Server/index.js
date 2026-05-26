const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDB } = require('./utils/db');
dotenv.config();

const app = express();


app.use(express.json());

app.use(cors({ origin: process.env.FRONTEND_URL }));

const userRoutes=require("./routes/user");
const incomeRoutes=require("./routes/income");
const expenseRoutes=require("./routes/expense");
const dashboardRoutes=require("./routes/dashboard");
const aiRoutes = require("./routes/ai");

app.use("/api/user",userRoutes);
app.use("/api/income",incomeRoutes);
app.use("/api/expense",expenseRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/ai", aiRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    connectToDB();
});