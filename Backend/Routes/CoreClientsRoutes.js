const express = require("express");
const multer = require("multer");
// const PostPropertyController = require("../Controllers/PostProperty");
const CoreClientController = require("../Controllers/CoreClientsController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./coreClients");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ✅ **Add Property**
router.post(
  "/addCoreClient",
  upload.single("photo"),
  CoreClientController.createCoreClient
);
router.get("/getallcoreclients", CoreClientController.GetAllcoreClients);
module.exports = router;
