const express = require("express");
const bcrypt = require("bcrypt");
const AgentSchema = require("../Models/AgentModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const CallExecutive = require("../Models/CallExecutiveModel");

secret = "Wealth@123";

const sendSMS = async (
  MobileNumber,
  FullName,
  Password,
  ReferralCode,
  refferedby
) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileNumber,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileNumber}\nPassword: ${Password}\nReferral code: ${ReferralCode}\nFor Any Query - 7796356789`,
      SenderName: process.env.SMS_SENDER_NAME || "WTHASC",
      TemplateId: process.env.SMS_TEMPLATE_ID || "1707173279362715516",
      MType: 1,
    };

    const response = await axios.get(apiUrl, { params });

    if (
      response.data &&
      response.data.toLowerCase().includes("sms sent successfully")
    ) {
      console.log("SMS Sent Successfully:", response.data);
      return response.data;
    } else {
      console.error("SMS API Error:", response.data || response);
      throw new Error(response.data || "Failed to send SMS");
    }
  } catch (error) {
    console.error("Error in sendSMS function:", error.message);
    throw new Error("SMS sending failed");
  }
};

const AgentSign = async (req, res) => {
  const {
    FullName,
    MobileNumber,
    Email,
    District,
    Contituency,
    Locations,
    Expertise,
    Experience,
    ReferredBy,
    MyRefferalCode,
    AgentType,
  } = req.body;

  try {
    const existingAgent = await AgentSchema.findOne({ MobileNumber:MobileNumber });
    const referredAgent = await AgentSchema.findOne({
      MyRefferalCode: ReferredBy,
    });

    if (existingAgent) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }else{

    const Password = "wa1234";
    const random = Math.floor(1000000 + Math.random() * 9000000);
    const refferedby = `${MyRefferalCode}${random}`;
    const finalReferredBy = ReferredBy || "WA0000000001";

   
    const newAgent = new AgentSchema({
      FullName,
      MobileNumber,
      Password,
      Email,
      District,
      Contituency,
      Locations,
      Expertise,
      Experience,
      ReferredBy: finalReferredBy,
      MyRefferalCode: refferedby,
      AgentType,
    });

    
    const callExecutives = await CallExecutive.find({ assignedType: "Agent_Wealth_Associate" })
      .sort({ lastAssignedAt: 1 }) 
      .limit(1); 

    if (callExecutives.length === 0) {
      return res
        .status(400)
        .json({ message: "No call executives available for agent assignment" });
    }

    const assignedExecutive = callExecutives[0];

    assignedExecutive.assignedUsers.push({
      userType: "Agent_Wealth_Associate",
      userId: newAgent._id,
    });
    assignedExecutive.lastAssignedAt = new Date();
    await assignedExecutive.save();

    // 3. Save the new agent
    await newAgent.save();

    // Send SMS (your existing code)
    let smsResponse;
    try {
      smsResponse = await sendSMS(
        MobileNumber,
        FullName,
        Password,
        finalReferredBy,
        refferedby
      );
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }

    // Call center API (your existing code)
    try {
      const callCenterResponse = await axios.get(
        "https://00ce1e10-d2c6-4f0e-a94f-f590280055c6.neodove.com/integration/custom/786e00dc-fb5a-4bf1-aaa3-7525277c8bf1/leads",
        {
          params: {
            name: FullName,
            mobile: MobileNumber,
            email: Email,
            detail1: `RefereralCode:${refferedby},ReferredBy:${
              referredAgent ? referredAgent.FullName : "WealthAssociate"
            }`,
          },
        }
      );
      console.log("Call center API response:", callCenterResponse.data);
    } catch (error) {
      console.error("Failed to call call center API:", error.message);
    }

    res.status(200).json({
      message: "Registration and assignment successful",
      smsResponse,
      assignedTo: assignedExecutive.name,
      executivePhone: assignedExecutive.phone,
    });}
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchReferredAgents = async (req, res) => {
  try {
    // Find the authenticated agent
    const authenticatedAgent = await AgentSchema.findById(req.AgentId);
    if (!authenticatedAgent) {
      return res.status(404).json({ error: "Authenticated agent not found" });
    }

    // Retrieve the MyRefferalCode of the authenticated agent
    const myReferralCode = authenticatedAgent.MyRefferalCode;

    // Fetch all agents whose ReferredBy matches the authenticated agent's MyRefferalCode
    const referredAgents = await AgentSchema.find({
      ReferredBy: myReferralCode,
    });

    // Return the result
    res.status(200).json({ message: "Your Agents", referredAgents });
  } catch (error) {
    console.error("Error fetching referred agents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const AgentLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Agents = await AgentSchema.findOne({
      MobileNumber: MobileNumber,
      Password: Password,
    });
    if (!Agents) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ AgentId: Agents._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getAgent = async (req, res) => {
  try {
    const agentDetails = await AgentSchema.findById(req.AgentId);
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateAgentDetails = async (req, res) => {
  const { MobileNumber, FullName, Email, Locations, Expertise, Experience } =
    req.body;

  try {
    const existingAgent = await AgentSchema.findOne({ MobileNumber });
    if (!existingAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    existingAgent.FullName = FullName || existingAgent.FullName;
    existingAgent.Email = Email || existingAgent.Email;
    existingAgent.Locations = Locations || existingAgent.Locations;
    existingAgent.Expertise = Expertise || existingAgent.Expertise;
    existingAgent.Experience = Experience || existingAgent.Experience;

    await existingAgent.save();

    res.status(200).json({ message: "Agent details updated successfully" });
  } catch (error) {
    console.error("Error updating agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await AgentSchema.find(); // Fetch all agents from the database
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the agent by ID
    const deletedAgent = await AgentSchema.findByIdAndDelete(id);

    if (!deletedAgent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateAgentByadmin = async (req, res) => {
  const { id } = req.params;
  const { FullName, District, Contituency, MobileNumber, MyRefferalCode,
    ReferredBy,AadhaarNumber,PANNumber,BankAccountNumber } =
    req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }

    const photoPath = `/Agents/${req.file.filename}`;

  try {
    const updatedAgent = await AgentSchema.findByIdAndUpdate(
      id,
      { FullName, District, Contituency, MobileNumber, MyRefferalCode,
        ReferredBy,AadhaarNumber,PANNumber,BankAccountNumber,photo: photoPath, },
      { new: true }
    );

    if (!updatedAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res
      .status(200)
      .json({ message: "Agent updated successfully", data: updatedAgent });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Failed to update agent" });
  }
};
const callDone = async (req, res) => {
  try {
    const agent = await AgentSchema.findByIdAndUpdate(
      req.params.id,
      { CallExecutiveCall: "Done" },
      { new: true }
    );
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json({ message: "Agent marked as done", data: agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  AgentSign,
  AgentLogin,
  getAgent,
  fetchReferredAgents,
  updateAgentDetails,
  getAllAgents,
  deleteAgent,
  updateAgentByadmin,
  callDone,
};
