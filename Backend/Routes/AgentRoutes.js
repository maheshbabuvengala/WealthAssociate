const express = require("express");
const AgentController = require("../Controllers/AgentController");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const ForgetPassword = require("../Controllers/ForgetPasswordController");
const multer = require("multer");
const app = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Agents");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
});

app.post("/AgentRegister", AgentController.AgentSign);
app.post("/AgentLogin", AgentController.AgentLogin);
app.get("/AgentDetails", verifyAgentToken, AgentController.getAgent);
app.post("/updateAgentDetails", AgentController.updateAgentDetails);
app.get("/myAgents", verifyAgentToken, AgentController.fetchReferredAgents);
app.post("/ForgetPassword", ForgetPassword.ForgetPassword);
app.post("/VerifyOtp", ForgetPassword.VerifyOtp);
app.post("/updatepassword", ForgetPassword.resetPassword);
app.get("/allagents", AgentController.getAllAgents);
app.delete("/deleteagent/:id", AgentController.deleteAgent);
app.put("/updateagent/:id",  upload.single("photo"),AgentController.updateAgentByadmin);
app.put("/markasdone/:id", AgentController.callDone);
module.exports = app;
