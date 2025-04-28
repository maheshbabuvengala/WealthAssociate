const fs = require("fs");
const path = require("path");
const Property = require("../Models/Property");
const AgentSchema = require("../Models/AgentModel");
const CustomerSchema = require("../Models/Customer");
const CoreSchema = require("../Models/CoreModel");
const skillSchema = require("../Models/SkillModel");
const nriSchema = require("../Models/NriModel");
const investorSchema = require("../Models/InvestorModel");
const mongoose = require("mongoose");
const axios = require("axios");
const getNearbyProperty = require("../Models/ApprovedPropertys");
const CallExecutive = require("../Models/CallExecutiveModel");
const ApprovedProperty = require("../Models/ApprovedPropertys")


const getReferrerDetails = async (req, res) => {
  const { PostedBy } = req.params;

  try {
    const collectionsPrimary = [AgentSchema, CustomerSchema, CoreSchema];
    let foundUser = null;
    let foundIn = "";

    for (let model of collectionsPrimary) {
      const user = await model.findOne({ MobileNumber: PostedBy });
      if (user) {
        foundUser = user;
        foundIn = model.modelName;
        console.log(`PostedBy found in: ${foundIn}`, user);
        break;
      }
    }

    if (foundUser && foundUser.ReferredBy) {
      const referredCode = foundUser.ReferredBy;
      console.log("ReferredBy code:", referredCode);

      for (let model of collectionsPrimary) {
        const ref = await model.findOne({ MyRefferalCode: referredCode });
        console.log(
          `Searching in ${model.modelName} with code: ${referredCode}`,
          ref
        );
        if (ref) {
          return res.json({
            postedByName: foundUser.FullName,
            name: ref.FullName,
            phone: ref.MobileNumber,
            source: model.modelName,
          });
        }
      }
    }

    const collectionsSecondary = [nriSchema, skillSchema, investorSchema];
    for (let model of collectionsSecondary) {
      const key = model.modelName === "NRI" ? "MobileIN" : "MobileNumber";
      const user = await model.findOne({ [key]: PostedBy });
      if (user && user.AddedBy) {
        const addedBy = user.AddedBy;
        const postedByName =
          model.modelName === "NRI" ? user.Name : user.FullName;

        const allCollections = [
          AgentSchema,
          CustomerSchema,
          CoreSchema,
          nriSchema,
          skillSchema,
          investorSchema,
        ];

        for (let searchModel of allCollections) {
          const field =
            searchModel.modelName === "NRI" ? "MobileIN" : "MobileNumber";
          const ref = await searchModel.findOne({ [field]: addedBy });
          if (ref) {
            const refName =
              searchModel.modelName === "NRI" ? ref.Name : ref.FullName;
            const refPhone =
              field === "MobileIN" ? ref.MobileIN : ref.MobileNumber;

            return res.json({
              postedByName,
              name: refName,
              phone: refPhone,
              source: searchModel.modelName,
            });
          }
        }
      }
    }

    return res.status(404).json({ message: "Referrer not found." });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// Create a new property
const createProperty = async (req, res) => {
  try {
    let {
      propertyType,
      location,
      price,
      PostedBy,
      Constituency,
      propertyDetails,
    } = req.body;

    // Validate PostedBy
    if (!PostedBy) {
      return res
        .status(400)
        .json({ message: "PostedBy (MobileNumber) is required." });
    }

    // Validate photo
    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "Photo is required." });
    }

    // Find the user who posted the property

    // Create and save new property
    const newProperty = new Property({
      propertyType,
      location,
      price,
      photo: photoPath,
      PostedBy,
      propertyDetails,
      Constituency,
    });

    await newProperty.save();

    // Assign property to call executive (round-robin)
    const callExecutives = await CallExecutive.find({
      assignedType: "Property",
    })
      .sort({ lastAssignedAt: 1 })
      .limit(1);

    if (callExecutives.length > 0) {
      const assignedExecutive = callExecutives[0];

      assignedExecutive.assignedUsers.push({
        userType: "Property",
        userId: newProperty._id,
      });
      assignedExecutive.lastAssignedAt = new Date();
      await assignedExecutive.save();
    }

    // Optional: Send data to call center API

    return res.status(200).json({
      message: "Property added and assigned successfully",
      newProperty,
      assignedTo:
        callExecutives.length > 0
          ? callExecutives[0].name
          : "No executive available",
    });
  } catch (error) {
    console.error("Error in createProperty:", error);
    return res.status(500).json({
      message: "Error adding property",
      error: error.message,
    });
  }
};

// module.exports = { createProperty };

// Get all properties
const GetAllPropertys = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const GetMyPropertys = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber;
    
    // First check the Property collection
    const properties = await Property.find({ PostedBy: mobileNumber });

    if (!properties || properties.length === 0) {
      // If not found in Property collection, check ApprovedProperty collection
      const approvedProperties = await ApprovedProperty.find({ PostedBy: mobileNumber });
      
      if (!approvedProperties || approvedProperties.length === 0) {
        return res.status(200).json({ 
          message: "No properties found for this user", 
          MyPosts: [] 
        });
      }
      
      return res.status(200).json(approvedProperties);
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

// Get properties posted by admin
const AdminProperties = async (req, res) => {
  try {
    const properties = await Property.find({ PostedUserType: "admin" });

    if (!properties || properties.length === 0) {
      return res
        .status(200)
        .json({ message: "No properties found for this user", MyPosts: [] });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

// Delete a property
const deletProperty = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received delete request for ID:", id);

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// **Edit Property Controller**
const editProperty = async (req, res) => {
  try {
    const { id } = req.params; // Property ID
    const { propertyType, location, price } = req.body;

    let updatedFields = { propertyType, location, price };

    // Handle photo update
    if (req.file) {
      updatedFields.photo = `/uploads/${req.file.filename}`;
    }

    // Update the property in the database
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res
      .status(200)
      .json({ message: "Property updated successfully", updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Error updating property", error });
  }
};

const updatePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNearbyProperties = async (req, res) => {
  try {
    const { constituency } = req.params;

    if (!constituency) {
      return res
        .status(400)
        .json({ message: "Constituency is required in params" });
    }

    // Fetch properties from database that match the constituency
    console.log(constituency);
    const properties = await getNearbyProperty.find({
      Constituency: constituency,
    });

    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found in this constituency" });
    }

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getReferredByDetails = async (req, res) => {
  const { referredBy } = req.body;

  if (!referredBy) {
    return res.status(400).json({ error: "referredBy is required" });
  }
console.log(referredBy)
  try {
    let referredUser =
      (await AgentSchema.findOne({ MyRefferalCode: referredBy })) ||
      (await CustomerSchema.findOne({ MyRefferalCode: referredBy })) ||
      (await CoreSchema.findOne({ MyRefferalCode: referredBy }));

    if (!referredUser) {
      referredUser =
        (await AgentSchema.findOne({ MobileNumber: referredBy })) ||
        (await CustomerSchema.findOne({ MobileNumber: referredBy })) ||
        (await CoreSchema.findOne({ MobileNumber: referredBy }));
    }

    if (!referredUser) {
      referredUser =
        (await skillSchema.findOne({ MobileNumber: referredBy })) ||
        (await investorSchema.findOne({ MobileNumber: referredBy })) ||
        (await nriSchema.findOne({ MobileIN: referredBy }));
    }

    if (referredUser) {
      return res.status(200).json({
        status: "success",
        referredByDetails: {
          name: referredUser.FullName || "N/A",
          Number: referredUser.MobileNumber || "N/A",
          name: referredUser.FullName || "N/A",
          Number: referredUser.MobileNumber || "N/A",
        },
      });
    } else {
      return res.status(200).json({
        status: "success",
        referredByDetails: {
          name: "Wealth Associate",
          Number: 7796356789,
        },
      });
    }
  } catch (error) {
    console.error("Error finding referredBy:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


// const Property = require('../models/propertyModel');

// Update dynamic data
const updateDynamicData = async (req, res) => {
  try {
    // 1. Validate property ID
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid property ID",
      });
    }

    // 2. Prepare update data
    const updateData = {
      $set: {
        dynamicData: req.body,
        editedAt: Date.now(),
      },
    };

    // 3. Find and update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // 4. Check if property exists
    if (!updatedProperty) {
      return res.status(404).json({
        status: "fail",
        message: "No property found with that ID",
      });
    }

    // 5. Send success response
    res.status(200).json({
      status: "success",
      data: {
        property: updatedProperty,
      },
    });
  } catch (err) {
    // Handle different types of errors
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid ID format",
      });
    }

    // Generic error handler
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: err.message,
    });
  }
};
module.exports = {
  createProperty,
  GetAllPropertys,
  GetMyPropertys,
  AdminProperties,
  deletProperty,
  editProperty,
  updatePropertyAdmin,
  getNearbyProperties,
  getReferredByDetails,
  updateDynamicData,
  getReferrerDetails,
};
