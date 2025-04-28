const Property = require("../Models/Property");
const ApprovedProperty = require("../Models/ApprovedPropertys");
const PushToken = require("../Models/NotificationToken");
const SoldedProperty=require("../Models/SoldPropertyModel")

const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // 2. Create an approved property entry
    const approvedProperty = new ApprovedProperty({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price,
      photo: property.photo,
      Constituency: property.Constituency,
      PostedBy: property.PostedBy,
      propertyDetails: property.propertyDetails
        ? property.propertyDetails
        : "no details",
      PostedUserType: property.PostedUserType,
      dynamicData: property.dynamicData || {},
    });

    await approvedProperty.save();
    console.log("Original property dynamicData:", property.dynamicData);
    console.log("Approved property dynamicData:", approvedProperty.dynamicData);
    await Property.findByIdAndDelete(id);

    // 3. Fetch all user push tokens
    const allTokens = await PushToken.find({});

    if (!allTokens.length) {
      return res.status(200).json({
        message: "Property approved, but no push tokens found to notify users.",
        approvedProperty,
      });
    }

    // 4. Construct notification message
    const title = "Wealth Associates\nNew Property Nearby";

    const body = `New ${property.propertyType} posted nearby you for ₹${property.price} in ${property.location}`;

    const notifications = allTokens.map((user) => ({
      to: user.expoPushToken,
      sound: "default",
      title,
      body,
    }));

    const chunks = [];
    while (notifications.length) {
      chunks.push(notifications.splice(0, 100));
    }

    for (const chunk of chunks) {
      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        const data = await response.json();
        console.log("Expo push response:", data);
      } catch (err) {
        console.error("Error sending push notification chunk:", err);
      }
    }

    // 6. Send final response
    res.status(200).json({
      message: "Property approved and push notifications sent to users",
      approvedProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// module.exports = approveProperty;
const GetAllApprovdPropertys = async (req, res) => {
  try {
    const properties = await ApprovedProperty.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const deletProperty = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received delete request for ID:", id);

    const property = await ApprovedProperty.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProperty = await ApprovedProperty.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
      }
    );

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



const SoldProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the property by ID
    const property = await ApprovedProperty.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // 2. Create an approved property entry
    const SoldProperty = new SoldedProperty({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price,
      photo: property.photo,
      Constituency: property.Constituency,
      PostedBy: property.PostedBy,
      propertyDetails: property.propertyDetails
        ? property.propertyDetails
        : "no details",
      PostedUserType: property.PostedUserType,
      dynamicData: property.dynamicData || {},
    });

    await SoldProperty.save();
    console.log("Original property dynamicData:", property.dynamicData);
    console.log("Approved property dynamicData:", SoldProperty.dynamicData);
    await ApprovedProperty.findByIdAndDelete(id);

    // 6. Send final response
    res.status(200).json({
      message: "Property approved and push notifications sent to users",
      SoldProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const GetAllSoldedPropertys = async (req, res) => {
  try {
    const properties = await SoldedProperty.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};
module.exports = {
  approveProperty,
  GetAllApprovdPropertys,
  deletProperty,
  updatePropertyAdmin,
  SoldProperty,
  GetAllSoldedPropertys,
};
