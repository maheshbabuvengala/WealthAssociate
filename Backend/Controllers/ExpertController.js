const expertModel = require("../Models/ExpertModel");

const sendSMS = async (MobileNumber, Password, AddedBy) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileNumber,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileNumber}\nPassword: ${Password}\nReferral code: ${AddedBy}\nFor Any Query - 7796356789`,
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

const registerExpert = async (req, res) => {
  try {
    // Destructure all possible fields from req.body
    const {
      // Common fields for all experts
      name,
      expertType,
      qualification,
      experience,
      location,
      mobile,
      officeAddress,

      // Legal Expert fields
      specialization,
      barCouncilId,
      courtAffiliation,
      lawFirmOrganisation,

      // Revenue Expert fields
      landTypeExpertise,
      revenueSpecialisation,
      govtApproval,
      certificationLicenseNumber,
      revenueOrganisation,
      keyServicesProvided,

      // Engineers fields
      engineeringField,
      engineerCertifications,
      projectsHandled,
      engineerOrganisation,
      specializedSkillsTechnologies,
      majorProjectsWorkedOn,
      govtLicensed,

      // Architects fields
      architectureType,
      softwareUsed,
      architectLicenseNumber,
      architectFirm,
      architectMajorProjects,

      // Survey fields
      surveyType,
      govtCertified,
      surveyOrganisation,
      surveyLicenseNumber,
      surveyMajorProjects,

      // Vaastu Pandits fields
      vaastuSpecialization,
      vaastuOrganisation,
      vaastuCertifications,
      remediesProvided,
      consultationMode,

      // Land Valuers fields
      valuationType,
      govtApproved,
      valuerLicenseNumber,
      valuerOrganisation,
      valuationMethods,

      // Banking fields
      bankingSpecialisation,
      bankingService,
      registeredWith,
      bankName,
      bankingGovtApproved,

      // Agriculture fields
      agricultureType,
      agricultureCertifications,
      agricultureOrganisation,
      servicesProvided,
      typesOfCrops,

      // Registration & Documentation fields
      registrationSpecialisation,
      documentType,
      processingTime,
      registrationGovtCertified,
      additionalServices,

      // Auditing fields
      auditingSpecialisation,
      auditType,
      auditCertificationNumber,
      auditOrganisation,
      auditServices,
      auditGovtCertified,

      // Licensing fields
      licensingSpecialisations,
      licensingCertificationNumber,
      licensingOrganisation,
      licensingServicesProvided,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }

    const photoPath = `/ExpertMembers/${req.file.filename}`;

    const expertData = {
      // Common fields
      name,
      expertType,
      qualification,
      experience,
      location,
      mobile,
      officeAddress,
      photo: photoPath,
    };

    const expertTypes = [
      "LEGAL",
      "REVENUE",
      "ENGINEERS",
      "ARCHITECTS",
      "PLANS & APPROVALS",
      "VAASTU PANDITS",
      "LAND SURVEY & VALUERS",
      "BANKING",
      "AGRICULTURE",
      "REGISTRATION & DOCUMENTATION",
      "AUDITING",
      "LIAISONING",
    ];

    // Add expert-type-specific fields based on expertType
    switch(expertType) {
      case 'LEGAL':
        Object.assign(expertData, {
          specialization,
          barCouncilId,
          courtAffiliation,
          lawFirmOrganisation,
        });
        break;
        
      case 'REVENUE':
        Object.assign(expertData, {
          landTypeExpertise,
          revenueSpecialisation,
          govtApproval,
          certificationLicenseNumber,
          revenueOrganisation,
          keyServicesProvided,
        });
        break;
        
      case 'ENGINEERS':
        Object.assign(expertData, {
          engineeringField,
          certifications: engineerCertifications,
          projectsHandled,
          engineerOrganisation,
          specializedSkillsTechnologies,
          majorProjectsWorkedOn,
          govtLicensed,
        });
        break;
        
      case 'ARCHITECTS':
        Object.assign(expertData, {
          architectureType,
          softwareUsed,
          architectLicenseNumber,
          architectFirm,
          architectMajorProjects,
        });
        break;
        
      case 'PLANS & APPROVALS':
        Object.assign(expertData, {
          surveyType,
          govtCertified,
          surveyOrganisation,
          surveyLicenseNumber,
          surveyMajorProjects,
        });
        break;
        
      case 'VAASTU PANDITS':
        Object.assign(expertData, {
          vaastuSpecialization,
          vaastuOrganisation,
          vaastuCertifications,
          remediesProvided,
          consultationMode,
        });
        break;
        
      case 'LAND SURVEY & VALUERS':
        Object.assign(expertData, {
          valuationType,
          govtApproved,
          valuerLicenseNumber,
          valuerOrganisation,
          valuationMethods,
        });
        break;
        
      case 'BANKING':
        Object.assign(expertData, {
          bankingSpecialisation,
          bankingService,
          registeredWith,
          bankName,
          bankingGovtApproved,
        });
        break;
        
      case 'AGRICULTURE':
        Object.assign(expertData, {
          agricultureType,
          agricultureCertifications,
          agricultureOrganisation,
          servicesProvided,
          typesOfCrops,
        });
        break;
        
      case 'REGISTRATION & DOCUMENTATION':
        Object.assign(expertData, {
          registrationSpecialisation,
          documentType,
          processingTime,
          registrationGovtCertified,
          additionalServices,
        });
        break;
        
      case 'AUDITING':
        Object.assign(expertData, {
          auditingSpecialisation,
          auditType,
          auditCertificationNumber,
          auditOrganisation,
          auditServices,
          auditGovtCertified,
        });
        break;
        
      case 'LIAISONING':
        Object.assign(expertData, {
          licensingSpecialisations,
          licensingCertificationNumber,
          licensingOrganisation,
          licensingServicesProvided,
        });
        break;
    }

    const newExpert = new expertModel(expertData);

    let smsResponse;
    const Password="wa1234"
    const AddedBy="WA0000000001"

    try {
      smsResponse = await sendSMS(mobile, Password, AddedBy);
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }
    await newExpert.save();

    res.status(201).json({
      success: true,
      message: "Expert registered successfully",
      expert: newExpert,
    });
  } catch (error) {
    console.error("Expert registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering expert",
      error: error.message,
    });
  }
};
const getExpertsByType = async (req, res) => {
  try {
    const { expertType } = req.params;
    const experts = await expertModel.find({ expertType: expertType });

    if (experts.length > 0) {
      res.status(200).json({ success: true, experts });
    } else {
      res
        .status(404)
        .json({ success: false, message: "No experts found for this type" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const modifyExpert = async (req, res) => {
  const { id } = req.params; // Get the expert ID from the URL params
  const {
    Name,
    Experttype,
    Qualification,
    Experience,
    Locations,
    Mobile,
    specialization, // For LEGAL, REVENUE, BANKING, AUDITING, REGISTRATION & DOCUMENTATION
    barCouncilId, // For LEGAL
    courtAffiliation, // For LEGAL
    lawFirm, // For LEGAL
    landTypeExpertise, // For REVENUE
    govtApproval, // For REVENUE, BANKING, AUDITING, REGISTRATION & DOCUMENTATION
    certificationNumber, // For REVENUE, ENGINEERS, AUDITING, LIAISONING
    organization, // For REVENUE, ENGINEERS, SURVEY, VAASTU PANDITS, LAND VALUERS, AGRICULTURE, AUDITING, LIAISONING
    servicesProvided, // For REVENUE, AGRICULTURE, LIAISONING
    engineeringField, // For ENGINEERS
    certifications, // For ENGINEERS, VAASTU PANDITS, AGRICULTURE
    projectsHandled, // For ENGINEERS
    specializedSkills, // For ENGINEERS
    majorProjects, // For ENGINEERS, ARCHITECTS, SURVEY
    govtLicensed, // For ENGINEERS
    architectureType, // For ARCHITECTS (using 'specialisation' in frontend)
    softwareUsed, // For ARCHITECTS
    licenseNumber, // For ARCHITECTS, SURVEY, LAND VALUERS, LIAISONING
    firmName, // For ARCHITECTS
    surveyType, // For SURVEY
    govtCertified, // For SURVEY, REGISTRATION & DOCUMENTATION, AUDITING
    vaastuSpecialization, // For VAASTU PANDITS
    remediesProvided, // For VAASTU PANDITS
    consultationMode, // For VAASTU PANDITS
    valuationType, // For LAND VALUERS
    govtApproved, // For LAND VALUERS, BANKING
    valuationMethods, // For LAND VALUERS
    bankingService, // For BANKING
    registeredWith, // For BANKING
    institutionName, // For BANKING
    agricultureType, // For AGRICULTURE
    cropTypes, // For AGRICULTURE
    documentType, // For REGISTRATION & DOCUMENTATION
    processingTime, // For REGISTRATION & DOCUMENTATION
    additionalServices, // For REGISTRATION & DOCUMENTATION
    auditType, // For AUDITING
    auditServices, // For AUDITING
    specialisations, // For LIAISONING (using 'specialisations' in frontend)
    // Add more fields as needed for other expert types
  } = req.body; // Get updated data from the request body

  const updateData = {
    Name,
    Experttype,
    Qualification,
    Experience,
    Locations,
    Mobile,
    specialization,
    barCouncilId,
    courtAffiliation,
    lawFirm,
    landTypeExpertise,
    govtApproval,
    certificationNumber,
    organization,
    servicesProvided,
    engineeringField,
    certifications,
    projectsHandled,
    specializedSkills,
    majorProjects,
    govtLicensed,
    architectureType,
    softwareUsed,
    licenseNumber,
    firmName,
    surveyType,
    govtCertified,
    vaastuSpecialization,
    remediesProvided,
    consultationMode,
    valuationType,
    govtApproved,
    valuationMethods,
    bankingService,
    registeredWith,
    institutionName,
    agricultureType,
    cropTypes,
    documentType,
    processingTime,
    additionalServices,
    auditType,
    auditServices,
    specialisations,
  };

  // Handle photo update if a new file is provided
  if (req.file) {
    updateData.photo = `/ExpertMembers/${req.file.filename}`;
  }

  try {
    const updatedExpert = await Expert.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (updatedExpert) {
      res.status(200).json({
        success: true,
        message: "Expert updated successfully",
        expert: updatedExpert,
      });
    } else {
      res.status(404).json({ success: false, message: "Expert not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during expert update",
      error: error.message,
    });
  }
};

const deleteExpert = async (req, res) => {
  const { id } = req.params; // Get the expert ID from the URL params

  try {
    const deletedExpert = await expertModel.findByIdAndDelete(id);

    if (deletedExpert) {
      res.status(200).json({
        success: true,
        message: "Expert deleted successfully",
      });
    } else {
      res.status(404).json({ success: false, message: "Expert not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllExperts = async (req, res) => {
  try {
    const agents = await expertModel.find(); // Fetch all agents from the database
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const callDone = async (req, res) => {
  try {
    const agent = await expertModel.findByIdAndUpdate(
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
  registerExpert,
  getExpertsByType,
  modifyExpert,
  deleteExpert,
  getAllExperts,
  callDone
};
