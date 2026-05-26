const mongoose = require("mongoose");
const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: {
      type: "String",
    },
    source: {
      type: "String",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Salary",
        "Freelance",
        "Investment",
        "Rental",
        "Business",
        "Other",
      ],
      default: "Other",
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
