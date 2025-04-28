const CoreClient = require("../Models/CoreClientsModel");

const createCoreClient = async (req, res) => {
  try {
    const { companyName, officeAddress, city, website, mobile } = req.body;

    let photoPath = null;
    if (req.file) {
      photoPath = `/coreClients/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "Photo is required." });
    }

    const newProperty = new CoreClient({
      companyName,
      officeAddress,
      city,
      website,
      mobile,
      photo: photoPath,
    });

    await newProperty.save();
    res
      .status(200)
      .json({ message: "Property added successfully", newProperty });
  } catch (error) {
    console.error("Error in createProperty:", error);
    res.status(500).json({ message: "Error adding property", error });
  }
};

const GetAllcoreClients = async (req, res) => {
  try {
    const properties = await CoreClient.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

module.exports = { createCoreClient, GetAllcoreClients };
