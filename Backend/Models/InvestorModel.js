const mongoose = require("mongoose");

const AddSInvestorSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  SelectSkill: {
    type: String,
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  MobileNumber: {
    type: String,
    required: true,
  },
  AddedBy: {
    type: String,
  },
  RegisteredBy: {
    type: String,
  },
});

const AddInvestor = mongoose.model("Investos", AddSInvestorSchema);
module.exports = AddInvestor;
