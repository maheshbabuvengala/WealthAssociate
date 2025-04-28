const express = require("express");
const multer = require("multer");
const PostPropertyController = require("../Controllers/PostProperty");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const CustomerToken = require("../middleWares/VerifyCustomerToken");
const CoreToken = require("../middleWares/VerifyCoreToken");
const verifyUser = require("../middleWares/VerifyUser");
const CoreClients = require("../Controllers/CoreClientsController");
const ApprovedProperty = require("../Controllers/ApprovedProprerty");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
});

// ✅ **Add Property**
router.post(
  "/addProperty",
  upload.single("photo"),
  PostPropertyController.createProperty
);
router.post(
  "/addcoreclient",
  upload.single("photo"),
  CoreClients.createCoreClient
);

router.get("/getallPropertys", PostPropertyController.GetAllPropertys);
router.get("/getreqreff/:PostedBy", PostPropertyController.getReferrerDetails);

router.get("/getAdminProperties", PostPropertyController.AdminProperties);

router.delete("/delete/:id", PostPropertyController.deletProperty);
router.delete("/approvedelete/:id", ApprovedProperty.deletProperty);

router.get(
  "/getMyPropertys",
  verifyUser,
  PostPropertyController.GetMyPropertys
);
router.put(
  "/editProperty/:id",
  upload.single("photo"),
  PostPropertyController.editProperty
);
router.put("/update/:id", PostPropertyController.updatePropertyAdmin);
router.put("/approveupdate/:id", ApprovedProperty.updatePropertyAdmin);
router.get("/getApproveProperty", ApprovedProperty.GetAllApprovdPropertys);
router.get("/getsoldProperty", ApprovedProperty.GetAllSoldedPropertys);
router.post("/approve/:id", ApprovedProperty.approveProperty);
router.post("/sold/:id", ApprovedProperty.SoldProperty);
router.get("/nearby/:constituency", PostPropertyController.getNearbyProperties);
router.post(
  "/getPropertyreffered",
  PostPropertyController.getReferredByDetails
);
// updateDynamicData;
router.patch("/:id/dynamic", PostPropertyController.updateDynamicData);

module.exports = router;
